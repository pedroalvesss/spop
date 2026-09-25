"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { notifyBudgetAlert } from "@/lib/budgetNotifier";
import { db } from "@/lib/db";
import { fromISO, monthKey, todayISO } from "@/lib/dates";
import { parseBRL } from "@/lib/money";
import { getUserId } from "@/lib/session";
import {
  installmentCents,
  transactionSchema,
  type TransactionInput,
} from "@/lib/schemas/transaction";
import { resolveTransactionRefs } from "./resolveTransactionRefs";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function postTransaction(input: TransactionInput): Promise<ActionResult> {
  const userId = await getUserId();
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;

  const refs = await resolveTransactionRefs(userId, data.source, data.categoryId);
  if (!refs) return { ok: false, error: "Conta ou categoria não encontrada." };

  const total = parseBRL(data.amount);
  const installments = data.type === "out" ? Number(data.installments) : 1;
  const base = { userId, ...refs, date: fromISO(data.date) };

  if (installments === 1) {
    await db.transaction.create({
      data: {
        ...base,
        description: data.description,
        amountCents: data.type === "out" ? -total : total,
      },
    });
  } else {
    // Compra parcelada: 1ª parcela vira transação e o resto vira dívida (com 1 parcela paga).
    const per = installmentCents(total, installments);
    await db.$transaction(async (tx) => {
      const debt = await tx.debt.create({
        data: {
          userId,
          ...refs,
          name: data.description,
          subtitle: `Parcelado em ${installments}x`,
          icon: "receipt",
          installmentCents: per,
          totalInstallments: installments,
          paidInstallments: 1,
        },
      });
      await tx.transaction.create({
        data: {
          ...base,
          description: `${data.description} (1/${installments})`,
          amountCents: -per,
          debtId: debt.id,
        },
      });
    });
  }

  // Alerta de orçamento só vale pro mês corrente, e sai depois da resposta pra não atrasar o modal.
  const month = monthKey(data.date);
  if (data.type === "out" && month === monthKey(todayISO())) {
    const spent = installments === 1 ? total : installmentCents(total, installments);
    after(() => notifyBudgetAlert(userId, refs.categoryId, month, spent));
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
