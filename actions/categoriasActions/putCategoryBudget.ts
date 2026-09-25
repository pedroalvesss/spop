"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseBRL } from "@/lib/money";
import { getUserId } from "@/lib/session";
import { budgetSchema, type BudgetInput } from "@/lib/schemas/common";

// Orçamento vazio ou zero tira a categoria do orçamento.
export async function putCategoryBudget(id: string, input: BudgetInput) {
  const userId = await getUserId();
  const { amount } = budgetSchema.parse(input);
  const cents = parseBRL(amount);
  await db.category.updateMany({
    where: { id, userId, type: "expense" },
    data: { monthlyBudgetCents: cents > 0 ? cents : null },
  });
  revalidatePath("/", "layout");
}
