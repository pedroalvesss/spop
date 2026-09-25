"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { fromISO, todayISO } from "@/lib/dates";
import { getUserId } from "@/lib/session";

// Paga a próxima parcela. Se a dívida tem conta (compra parcelada), a parcela vira lançamento.
export async function postDebtPayment(id: string) {
  const userId = await getUserId();
  const debt = await db.debt.findFirst({ where: { id, userId } });
  if (!debt || debt.paidInstallments >= debt.totalInstallments) return;

  const n = debt.paidInstallments + 1;
  await db.$transaction(async (tx) => {
    await tx.debt.update({ where: { id }, data: { paidInstallments: n } });
    if (debt.accountId && debt.categoryId) {
      await tx.transaction.create({
        data: {
          userId,
          accountId: debt.accountId,
          categoryId: debt.categoryId,
          cardId: debt.cardId,
          debtId: debt.id,
          amountCents: -debt.installmentCents,
          description: `${debt.name} (${n}/${debt.totalInstallments})`,
          date: fromISO(todayISO()),
        },
      });
    }
  });
  revalidatePath("/", "layout");
}
