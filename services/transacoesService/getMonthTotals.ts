import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { monthRange } from "@/lib/dates";
import { getUserId } from "@/lib/session";

export interface MonthTotals {
  incomeCents: number;
  expenseCents: number;
  // Quanto saiu por categoria (positivo).
  spentByCategory: Record<string, number>;
}

export const getMonthTotals = cache(async (month: string): Promise<MonthTotals> => {
  const { start, end } = monthRange(month);
  const where = { userId: await getUserId(), date: { gte: start, lt: end } };
  const [income, byCategory] = await Promise.all([
    db.transaction.aggregate({
      where: { ...where, amountCents: { gt: 0 } },
      _sum: { amountCents: true },
    }),
    db.transaction.groupBy({
      by: ["categoryId"],
      where: { ...where, amountCents: { lt: 0 } },
      _sum: { amountCents: true },
    }),
  ]);
  const spentByCategory = Object.fromEntries(
    byCategory.map((c) => [c.categoryId, -(c._sum.amountCents ?? 0)]),
  );
  return {
    incomeCents: income._sum.amountCents ?? 0,
    expenseCents: Object.values(spentByCategory).reduce((a, v) => a + v, 0),
    spentByCategory,
  };
});
