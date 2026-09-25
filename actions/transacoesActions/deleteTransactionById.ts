"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

export async function deleteTransactionById(id: string) {
  const userId = await getUserId();
  await db.transaction.deleteMany({ where: { id, userId } });
  revalidatePath("/", "layout");
}
