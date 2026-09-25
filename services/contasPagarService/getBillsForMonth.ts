import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { dateInMonth } from "@/lib/dates";
import { getUserId } from "@/lib/session";
import { sortBills, type BillView } from "@/lib/bills";

// Contas recorrentes com o status de pagamento do mês pedido.
export const getBillsForMonth = cache(async (month: string): Promise<BillView[]> => {
  const bills = await db.bill.findMany({
    where: { userId: await getUserId(), active: true },
    select: {
      id: true,
      name: true,
      icon: true,
      amountCents: true,
      dueDay: true,
      categoryId: true,
      accountId: true,
      payments: { where: { month }, select: { id: true } },
    },
  });
  return sortBills(
    bills.map(({ payments, ...bill }) => ({
      ...bill,
      dueDate: dateInMonth(month, bill.dueDay),
      paid: payments.length > 0,
    })),
  );
});
