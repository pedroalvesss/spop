import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

export interface AccountWithBalance {
  id: string;
  name: string;
  color: string;
  active: boolean;
  initialBalanceCents: number;
  balanceCents: number;
}

// Saldo da conta = saldo inicial + soma de todas as transações dela.
export const getAccountsWithBalance = cache(async (): Promise<AccountWithBalance[]> => {
  const userId = await getUserId();
  const [accounts, sums] = await Promise.all([
    db.account.findMany({
      where: { userId },
      select: { id: true, name: true, color: true, active: true, initialBalanceCents: true },
      orderBy: { createdAt: "asc" },
    }),
    db.transaction.groupBy({ by: ["accountId"], where: { userId }, _sum: { amountCents: true } }),
  ]);
  const byAccount = new Map(sums.map((s) => [s.accountId, s._sum.amountCents ?? 0]));
  return accounts.map((a) => ({
    ...a,
    balanceCents: a.initialBalanceCents + (byAccount.get(a.id) ?? 0),
  }));
});
