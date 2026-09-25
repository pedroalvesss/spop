"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";
import { preferencesSchema, type PreferencesInput } from "@/lib/schemas/settings";

export async function putUserPreferences(input: PreferencesInput) {
  const userId = await getUserId();
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  await db.user.update({ where: { id: userId }, data: parsed.data });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
