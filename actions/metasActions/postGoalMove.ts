"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseBRL } from "@/lib/money";
import { getUserId } from "@/lib/session";
import { goalMoveSchema, type GoalMoveInput } from "@/lib/schemas/goal";

// Guardar ou resgatar dinheiro da caixinha. Resgate nunca deixa o saldo negativo.
export async function postGoalMove(id: string, input: GoalMoveInput) {
  const userId = await getUserId();
  const { direction, amount } = goalMoveSchema.parse(input);
  const goal = await db.goal.findFirst({ where: { id, userId }, select: { currentCents: true } });
  if (!goal) return;

  const cents = parseBRL(amount);
  const currentCents =
    direction === "in" ? goal.currentCents + cents : Math.max(0, goal.currentCents - cents);
  await db.goal.update({ where: { id }, data: { currentCents } });
  revalidatePath("/", "layout");
}
