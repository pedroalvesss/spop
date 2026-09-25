"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseBRL } from "@/lib/money";
import { getUserId } from "@/lib/session";
import { accountSchema, type AccountInput } from "@/lib/schemas/settings";

// A pessoa informa o saldo de hoje; o saldo inicial é ajustado pra bater com os lançamentos.
export async function putAccount(id: string, input: AccountInput) {
  const userId = await getUserId();
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };

  const { name, balance } = parsed.data;
  const cents = parseBRL(balance) * (balance.trim().startsWith("-") ? -1 : 1);
  const sum = await db.transaction.aggregate({
    where: { userId, accountId: id },
    _sum: { amountCents: true },
  });
  await db.account.updateMany({
    where: { id, userId },
    data: { name, initialBalanceCents: cents - (sum._sum.amountCents ?? 0) },
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
