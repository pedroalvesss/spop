"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

// Desliga a sincronização. O que já foi importado continua no histórico.
export async function deleteBankConnection() {
  const userId = await getUserId();
  await db.bankConnection.deleteMany({ where: { userId } });
  revalidatePath("/", "layout");
}
