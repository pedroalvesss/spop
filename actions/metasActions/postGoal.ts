"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseBRL } from "@/lib/money";
import { getUserId } from "@/lib/session";
import { goalSchema, type GoalInput } from "@/lib/schemas/goal";

type SaveResult = { ok: true } | { ok: false; error: string };

// Cria (sem id) ou edita (com id) uma caixinha.
export async function postGoal(input: GoalInput, id?: string): Promise<SaveResult> {
  const userId = await getUserId();
  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { target, current, ...rest } = parsed.data;
  const data = { ...rest, targetCents: parseBRL(target), currentCents: parseBRL(current) };

  if (id) await db.goal.updateMany({ where: { id, userId }, data });
  else await db.goal.create({ data: { ...data, userId } });

  revalidatePath("/", "layout");
  return { ok: true };
}
