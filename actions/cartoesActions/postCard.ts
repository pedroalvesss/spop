"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseBRL } from "@/lib/money";
import { getUserId } from "@/lib/session";
import { cardSchema, type CardInput } from "@/lib/schemas/card";

type SaveResult = { ok: true } | { ok: false; error: string };

// Cria (sem id) ou edita (com id) um cartão de crédito.
export async function postCard(input: CardInput, id?: string): Promise<SaveResult> {
  const userId = await getUserId();
  const parsed = cardSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { limit, ...rest } = parsed.data;

  const account = await db.account.findFirst({
    where: { id: rest.accountId, userId },
    select: { id: true },
  });
  if (!account) return { ok: false, error: "Banco não encontrado." };

  const data = { ...rest, limitCents: parseBRL(limit) };
  if (id) await db.creditCard.updateMany({ where: { id, userId }, data });
  else await db.creditCard.create({ data: { ...data, userId } });

  revalidatePath("/", "layout");
  return { ok: true };
}
