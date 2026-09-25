"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

export async function deleteGoalById(id: string) {
  const userId = await getUserId();
  await db.goal.deleteMany({ where: { id, userId } });
  revalidatePath("/", "layout");
}
