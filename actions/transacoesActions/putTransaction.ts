"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { fromISO } from "@/lib/dates";
import { parseBRL } from "@/lib/money";
import { getUserId } from "@/lib/session";
import { transactionSchema, type TransactionInput } from "@/lib/schemas/transaction";
import type { ActionResult } from "./postTransaction";
import { resolveTransactionRefs } from "./resolveTransactionRefs";

// Edição não mexe em parcelas: a dívida ligada continua como está.
export async function putTransaction(id: string, input: TransactionInput): Promise<ActionResult> {
  const userId = await getUserId();
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;

  const refs = await resolveTransactionRefs(userId, data.source, data.categoryId);
  if (!refs) return { ok: false, error: "Conta ou categoria não encontrada." };

  const total = parseBRL(data.amount);
  const { count } = await db.transaction.updateMany({
    where: { id, userId },
    data: {
      ...refs,
      description: data.description,
      date: fromISO(data.date),
      amountCents: data.type === "out" ? -total : total,
    },
  });
  if (count === 0) return { ok: false, error: "Esse lançamento não existe mais." };

  revalidatePath("/", "layout");
  return { ok: true };
}
