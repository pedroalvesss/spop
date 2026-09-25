"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

// As parcelas já lançadas continuam no extrato (debtId vira null).
export async function deleteDebtById(id: string) {
  const userId = await getUserId();
  await db.debt.deleteMany({ where: { id, userId } });
  revalidatePath("/", "layout");
}
