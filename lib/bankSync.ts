import "server-only";
import { pickCategory, toImported } from "@/lib/bankImport";
import { notifyBudgetAlert } from "@/lib/budgetNotifier";
import { db } from "@/lib/db";
import { addDays, fromISO, monthKey, toISO, todayISO } from "@/lib/dates";
import { pluggyEnabled } from "@/lib/pluggy";
import { getPluggyAccounts } from "@/services/pluggyService/getPluggyAccounts";
import { getPluggyTransactions } from "@/services/pluggyService/getPluggyTransactions";

// Olha pra trás 30 dias: pega transação que o banco atualizou (pendente → lançada) ou trocou de ID.
const WINDOW_DAYS = 30;
const STALE_MS = 60 * 60_000;

export async function syncBankConnection(userId: string) {
  const connection = await db.bankConnection.findUnique({
    where: { userId },
    include: { card: { select: { accountId: true } } },
  });
  if (!connection) return null;

  const today = todayISO();
  const from = [toISO(connection.since), addDays(today, -WINDOW_DAYS)].sort()[1];
  const [accounts, categories] = await Promise.all([
    getPluggyAccounts(connection.itemId),
    db.category.findMany({
      where: { userId, active: true },
      select: { id: true, name: true, type: true },
    }),
  ]);

  const incoming = [];
  for (const account of accounts) {
    const isCard = account.type === "CREDIT";
    if (isCard && !connection.cardId) continue;
    for (const t of await getPluggyTransactions(account.id, from)) {
      const imported = toImported(t, account.type);
      // Parcela futura do cartão entra quando chegar o dia dela.
      if (!imported || imported.date < from || imported.date > today) continue;
      const categoryId = pickCategory(imported, categories);
      if (!categoryId) continue;
      incoming.push({
        ...imported,
        categoryId,
        cardId: isCard ? connection.cardId : null,
        accountId: isCard ? connection.card!.accountId : connection.accountId,
      });
    }
  }

  const existing = await db.transaction.findMany({
    where: { userId, externalId: { not: null }, date: { gte: fromISO(from) } },
    select: { id: true, externalId: true, amountCents: true, date: true },
  });
  const byExternalId = new Map(existing.map((e) => [e.externalId, e]));
  const incomingIds = new Set(incoming.map((t) => t.externalId));

  const fresh = incoming.filter((t) => !byExternalId.has(t.externalId));
  // Valor e data são do banco; descrição e categoria a pessoa pode ter editado, então ficam.
  const changed = incoming.flatMap((t) => {
    const e = byExternalId.get(t.externalId);
    return e && (e.amountCents !== t.amountCents || toISO(e.date) !== t.date)
      ? [{ id: e.id, amountCents: t.amountCents, date: fromISO(t.date) }]
      : [];
  });
  // Sumiu da Pluggy (ela recria a transação com outro ID quando muda muito). Com a lista vazia,
  // pode ser falha do lado de lá, então não apaga nada.
  const gone = incoming.length
    ? existing.filter((e) => !incomingIds.has(e.externalId!)).map((e) => e.id)
    : [];

  await db.$transaction([
    db.transaction.createMany({
      data: fresh.map((t) => ({
        userId,
        accountId: t.accountId,
        cardId: t.cardId,
        categoryId: t.categoryId,
        amountCents: t.amountCents,
        description: t.description,
        date: fromISO(t.date),
        externalId: t.externalId,
      })),
      skipDuplicates: true,
    }),
    ...changed.map(({ id, ...data }) => db.transaction.update({ where: { id }, data })),
    db.transaction.deleteMany({ where: { id: { in: gone } } }),
    db.bankConnection.update({ where: { userId }, data: { syncedAt: new Date() } }),
  ]);

  // Gasto novo do mês pode estourar orçamento: mesmo aviso de quando lança à mão.
  const month = monthKey(today);
  const spentByCategory = new Map<string, number>();
  for (const t of fresh) {
    if (t.amountCents < 0 && monthKey(t.date) === month) {
      spentByCategory.set(t.categoryId, (spentByCategory.get(t.categoryId) ?? 0) - t.amountCents);
    }
  }
  for (const [categoryId, cents] of spentByCategory) {
    await notifyBudgetAlert(userId, categoryId, month, cents);
  }

  return { imported: fresh.length };
}

// Abrir o app puxa o que tiver de novo, no máximo uma vez por hora.
export async function syncBankIfStale(userId: string) {
  if (!pluggyEnabled()) return;
  const stale = await db.bankConnection.findFirst({
    where: {
      userId,
      OR: [{ syncedAt: null }, { syncedAt: { lt: new Date(Date.now() - STALE_MS) } }],
    },
    select: { id: true },
  });
  if (!stale) return;
  try {
    await syncBankConnection(userId);
  } catch (error) {
    console.error("[banco] sincronização falhou", error);
  }
}

// Cron diário: garante que o banco entra mesmo se ninguém abrir o app.
export async function syncAllBanks() {
  const connections = await db.bankConnection.findMany({ select: { userId: true } });
  for (const { userId } of connections) await syncBankIfStale(userId);
  return connections.length;
}
