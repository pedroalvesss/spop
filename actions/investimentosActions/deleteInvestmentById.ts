"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

export async function deleteInvestmentById(id: string) {
  const userId = await getUserId();
  await db.investment.deleteMany({ where: { id, userId } });
  revalidatePath("/", "layout");
}
