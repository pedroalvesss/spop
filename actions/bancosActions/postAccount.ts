"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";
import { ACCOUNT_COLORS, newAccountSchema, type NewAccountInput } from "@/lib/schemas/settings";

export async function postAccount(input: NewAccountInput) {
  const userId = await getUserId();
  const parsed = newAccountSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const count = await db.account.count({ where: { userId } });
  await db.account.create({
    data: {
      userId,
      name: parsed.data.name,
      color: ACCOUNT_COLORS[count % ACCOUNT_COLORS.length],
    },
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
