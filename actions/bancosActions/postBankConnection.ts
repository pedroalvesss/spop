"use server";

import { revalidatePath } from "next/cache";
import { syncBankConnection } from "@/lib/bankSync";
import { db } from "@/lib/db";
import { fromISO } from "@/lib/dates";
import { pluggyEnabled } from "@/lib/pluggy";
import { getUserId } from "@/lib/session";
import { bankConnectionSchema, type BankConnectionInput } from "@/lib/schemas/settings";
import { getPluggyItem } from "@/services/pluggyService/getPluggyItem";

const fail = (error: string) => ({ ok: false as const, error });

export async function postBankConnection(input: BankConnectionInput) {
  const userId = await getUserId();
  const parsed = bankConnectionSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  if (!pluggyEnabled()) return fail("Falta configurar a Pluggy no servidor.");
  const { itemId, accountId, cardId, since } = parsed.data;

  const [account, card, taken] = await Promise.all([
    db.account.findFirst({ where: { id: accountId, userId }, select: { id: true } }),
    cardId
      ? db.creditCard.findFirst({ where: { id: cardId, userId }, select: { id: true } })
      : null,
    db.bankConnection.findUnique({ where: { itemId }, select: { userId: true } }),
  ]);
  if (!account || (cardId && !card)) return fail("Conta ou cartão não encontrado.");
  if (taken && taken.userId !== userId) return fail("Esse banco já está ligado em outra conta.");

  const item = await getPluggyItem(itemId).catch(() => undefined);
  if (item === undefined) return fail("A Pluggy não respondeu. Tenta de novo daqui a pouco.");
  if (!item) return fail("Não achei essa conexão na Pluggy. Confere o Item ID.");

  const data = {
    itemId,
    bankName: item.connector.name,
    accountId,
    cardId: cardId || null,
    since: fromISO(since),
  };
  await db.bankConnection.upsert({ where: { userId }, create: { userId, ...data }, update: data });
  // Primeira leva já entra agora; se a Pluggy falhar, a próxima abertura do app tenta de novo.
  const synced = await syncBankConnection(userId).catch(() => null);

  revalidatePath("/", "layout");
  return { ok: true as const, imported: synced?.imported ?? 0 };
}
