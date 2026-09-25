"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

// Tirar o cartão só desativa: as compras antigas continuam no extrato.
export async function deleteCardById(id: string) {
  const userId = await getUserId();
  await db.creditCard.updateMany({ where: { id, userId }, data: { active: false } });
  revalidatePath("/", "layout");
}
