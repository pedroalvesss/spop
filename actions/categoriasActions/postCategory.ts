"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseBRL } from "@/lib/money";
import { getUserId } from "@/lib/session";
import { categorySchema, type CategoryInput } from "@/lib/schemas/settings";

// Cria (sem id) ou edita (com id). Orçamento só existe pra categoria de saída.
export async function postCategory(input: CategoryInput, id?: string) {
  const userId = await getUserId();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const { budget, ...rest } = parsed.data;
  const budgetCents = parseBRL(budget);
  const data = {
    ...rest,
    monthlyBudgetCents: rest.type === "expense" && budgetCents > 0 ? budgetCents : null,
  };

  if (id) await db.category.updateMany({ where: { id, userId }, data });
  else await db.category.create({ data: { ...data, userId } });

  revalidatePath("/", "layout");
  return { ok: true as const };
}
