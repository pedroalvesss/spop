"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { monthKey, todayISO } from "@/lib/dates";
import { rebase } from "@/lib/investments";
import { parseBRL } from "@/lib/money";
import { getUserId } from "@/lib/session";
import { investmentSchema, type InvestmentInput } from "@/lib/schemas/investment";

type SaveResult = { ok: true } | { ok: false; error: string };

// Sem integração com corretora: o valor é atualizado na mão.
export async function postInvestment(input: InvestmentInput, id?: string): Promise<SaveResult> {
  const userId = await getUserId();
  const parsed = investmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { amount, ...rest } = parsed.data;
  const cents = parseBRL(amount);
  const month = monthKey(todayISO());

  if (id) {
    const current = await db.investment.findFirst({ where: { id, userId } });
    if (!current) return { ok: false, error: "Esse investimento não existe mais." };
    await db.investment.update({
      where: { id },
      data: { ...rest, ...rebase(current, cents, month) },
    });
  } else {
    await db.investment.create({
      data: { ...rest, userId, amountCents: cents, baseCents: cents, baseMonth: month },
    });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
