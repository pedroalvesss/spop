import "server-only";
import { db } from "@/lib/db";
import { addMonths, fromISO, monthRange, toISO } from "@/lib/dates";
import { monthlyFlows, type MonthFlow } from "@/lib/reports";
import { getUserId } from "@/lib/session";

// ponytail: soma em JS; com milhares de lançamentos/mês, trocar por GROUP BY date_trunc no SQL.
export async function getMonthlyFlows(currentMonth: string, months: number): Promise<MonthFlow[]> {
  const rows = await db.transaction.findMany({
    where: {
      userId: await getUserId(),
      date: {
        gte: fromISO(`${addMonths(currentMonth, 1 - months)}-01`),
        lt: monthRange(currentMonth).end,
      },
    },
    select: { date: true, amountCents: true },
  });
  return monthlyFlows(
    rows.map((r) => ({ date: toISO(r.date), amountCents: r.amountCents })),
    currentMonth,
    months,
  );
}
