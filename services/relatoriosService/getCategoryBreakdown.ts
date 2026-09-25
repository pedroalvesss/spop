import "server-only";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";
import { getMonthTotals } from "@/services/transacoesService/getMonthTotals";

export interface CategorySlice {
  id: string;
  name: string;
  icon: string;
  spentCents: number;
  share: number;
}

// Pra onde foi o dinheiro no mês, da categoria que mais levou pra que menos levou.
export async function getCategoryBreakdown(month: string): Promise<CategorySlice[]> {
  const { spentByCategory, expenseCents } = await getMonthTotals(month);
  const categories = await db.category.findMany({
    where: { userId: await getUserId(), id: { in: Object.keys(spentByCategory) } },
    select: { id: true, name: true, icon: true },
  });
  return categories
    .map((c) => ({
      ...c,
      spentCents: spentByCategory[c.id],
      share: expenseCents > 0 ? spentByCategory[c.id] / expenseCents : 0,
    }))
    .sort((a, b) => b.spentCents - a.spentCents);
}
