"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

// Conta desligada some do saldo, dos chips e do lançamento. O histórico fica guardado.
export async function putAccountActive(id: string, active: boolean) {
  const userId = await getUserId();
  await db.account.updateMany({ where: { id, userId }, data: { active } });
  revalidatePath("/", "layout");
}
