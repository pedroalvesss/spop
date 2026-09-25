"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

// Categoria com lançamentos não pode sumir do banco: ela só é desativada.
export async function deleteCategoryById(id: string) {
  const userId = await getUserId();
  await db.category.updateMany({ where: { id, userId }, data: { active: false } });
  revalidatePath("/", "layout");
}
