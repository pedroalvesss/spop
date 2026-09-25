import "server-only";
import { db } from "@/lib/db";
import { dateInMonth, monthKey } from "@/lib/dates";
import type { BillView } from "@/lib/bills";
import { dueBills } from "@/lib/notifications";

export interface BillReminder {
  userId: string;
  name: string;
  email: string;
  emailReminders: boolean;
  bills: BillView[];
}

// Roda no cron (sem sessão): todas as pessoas com conta vencendo hoje ou amanhã.
export async function getBillReminders(today: string): Promise<BillReminder[]> {
  const month = monthKey(today);
  const users = await db.user.findMany({
    where: { bills: { some: { active: true } } },
    select: {
      id: true,
      name: true,
      email: true,
      emailReminders: true,
      bills: {
        where: { active: true },
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
      },
    },
  });

  return users
    .map(({ id, bills, ...user }) => ({
      ...user,
      userId: id,
      bills: dueBills(
        bills.map(({ payments, ...bill }) => ({
          ...bill,
          dueDate: dateInMonth(month, bill.dueDay),
          paid: payments.length > 0,
        })),
        today,
      ),
    }))
    .filter((r) => r.bills.length > 0);
}
