"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseBRL } from "@/lib/money";
import { getUserId } from "@/lib/session";
import { debtSchema, type DebtInput } from "@/lib/schemas/debt";

type SaveResult = { ok: true } | { ok: false; error: string };

// Cria (sem id) ou edita (com id). Com conta escolhida, cada parcela paga vira uma saída em "Outros".
export async function postDebt(input: DebtInput, id?: string): Promise<SaveResult> {
  const userId = await getUserId();
  const parsed = debtSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { installment, accountId, ...rest } = parsed.data;

  const [account, categories] = await Promise.all([
    accountId
      ? db.account.findFirst({ where: { id: accountId, userId }, select: { id: true } })
      : null,
    db.category.findMany({
      where: { userId, type: "expense", active: true },
      select: { id: true, name: true },
    }),
  ]);
  const fallbackCategory = categories.find((c) => c.name === "Outros") ?? categories[0];

  const data = {
    ...rest,
    subtitle: rest.subtitle || `${rest.totalInstallments} parcelas`,
    installmentCents: parseBRL(installment),
    accountId: account?.id ?? null,
  };

  if (id) {
    await db.debt.updateMany({ where: { id, userId }, data });
  } else {
    await db.debt.create({
      data: { ...data, userId, categoryId: account ? fallbackCategory?.id : null },
    });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
