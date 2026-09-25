import "server-only";
import { db } from "@/lib/db";
import { monthRange } from "@/lib/dates";
import { budgetAlert } from "@/lib/notifications";
import { sendPushToUser } from "@/lib/push";

// Roda depois de uma saída nova: se a categoria cruzou 85% ou 100% do orçamento, manda push.
export async function notifyBudgetAlert(
  userId: string,
  categoryId: string,
  month: string,
  addedCents: number,
) {
  const category = await db.category.findFirst({
    where: { id: categoryId, userId },
    select: { name: true, monthlyBudgetCents: true },
  });
  if (!category?.monthlyBudgetCents) return;

  const { start, end } = monthRange(month);
  const spent = await db.transaction.aggregate({
    where: { userId, categoryId, amountCents: { lt: 0 }, date: { gte: start, lt: end } },
    _sum: { amountCents: true },
  });
  const after = -(spent._sum.amountCents ?? 0);
  const alert = budgetAlert(category.name, category.monthlyBudgetCents, after - addedCents, after);
  if (alert) await sendPushToUser(userId, alert);
}
