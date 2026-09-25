"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseBRL } from "@/lib/money";
import { getUserId } from "@/lib/session";
import { billSchema, type BillInput } from "@/lib/schemas/bill";

type SaveResult = { ok: true } | { ok: false; error: string };

// Cria (sem id) ou edita (com id) uma conta a pagar.
export async function postBill(input: BillInput, id?: string): Promise<SaveResult> {
  const userId = await getUserId();
  const parsed = billSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { amount, categoryId, accountId, ...rest } = parsed.data;

  const [category, account] = await Promise.all([
    categoryId
      ? db.category.findFirst({ where: { id: categoryId, userId }, select: { id: true } })
      : null,
    accountId
      ? db.account.findFirst({ where: { id: accountId, userId }, select: { id: true } })
      : null,
  ]);
  const data = {
    ...rest,
    amountCents: parseBRL(amount),
    categoryId: category?.id ?? null,
    accountId: account?.id ?? null,
  };

  if (id) await db.bill.updateMany({ where: { id, userId }, data });
  else await db.bill.create({ data: { ...data, userId } });

  revalidatePath("/", "layout");
  return { ok: true };
}
