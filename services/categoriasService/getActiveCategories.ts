import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

export interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  type: "expense" | "income";
  monthlyBudgetCents: number | null;
}

export const getActiveCategories = cache(async (): Promise<CategoryOption[]> => {
  return db.category.findMany({
    where: { userId: await getUserId(), active: true },
    select: { id: true, name: true, icon: true, type: true, monthlyBudgetCents: true },
    orderBy: { createdAt: "asc" },
  });
});
