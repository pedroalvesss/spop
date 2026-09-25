"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

// Apagar só desativa: pagamentos antigos continuam no histórico.
export async function deleteBillById(id: string) {
  const userId = await getUserId();
  await db.bill.updateMany({ where: { id, userId }, data: { active: false } });
  revalidatePath("/", "layout");
}
