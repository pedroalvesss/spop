"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { fromISO, monthKey, todayISO } from "@/lib/dates";
import { getUserId } from "@/lib/session";

// Alterna pago/não pago no mês atual. Se a preferência estiver ligada, pagar também lança a saída.
export async function postBillPayment(billId: string) {
  const userId = await getUserId();
  const today = todayISO();
  const month = monthKey(today);
  const bill = await db.bill.findFirst({
    where: { id: billId, userId },
    include: { payments: { where: { month } }, user: { select: { billCreatesTransaction: true } } },
  });
  if (!bill) return;

  const payment = bill.payments[0];
  if (payment) {
    await db.$transaction([
      db.billPayment.delete({ where: { id: payment.id } }),
      ...(payment.transactionId
        ? [db.transaction.deleteMany({ where: { id: payment.transactionId, userId } })]
        : []),
    ]);
  } else {
    const { categoryId, accountId } = bill;
    const createTx = bill.user.billCreatesTransaction && categoryId && accountId;
    await db.$transaction(async (tx) => {
      const transaction = createTx
        ? await tx.transaction.create({
            data: {
              userId,
              accountId,
              categoryId,
              amountCents: -bill.amountCents,
              description: bill.name,
              date: fromISO(today),
            },
          })
        : null;
      await tx.billPayment.create({
        data: { billId, month, transactionId: transaction?.id ?? null },
      });
    });
  }
  revalidatePath("/", "layout");
}
