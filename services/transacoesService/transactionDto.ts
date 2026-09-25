import "server-only";
import { toISO } from "@/lib/dates";

// DTO do lançamento: só o que as telas usam, nada de userId ou timestamps internos.
export interface TransactionDto {
  id: string;
  description: string;
  amountCents: number;
  date: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  accountId: string;
  accountName: string;
  cardId: string | null;
  fromInstallment: boolean;
}

export const transactionSelect = {
  id: true,
  description: true,
  amountCents: true,
  date: true,
  categoryId: true,
  accountId: true,
  cardId: true,
  debtId: true,
  category: { select: { name: true, icon: true } },
  account: { select: { name: true } },
} as const;

interface TransactionRecord {
  id: string;
  description: string;
  amountCents: number;
  date: Date;
  categoryId: string;
  accountId: string;
  cardId: string | null;
  debtId: string | null;
  category: { name: string; icon: string };
  account: { name: string };
}

export function toTransactionDto(t: TransactionRecord): TransactionDto {
  return {
    id: t.id,
    description: t.description,
    amountCents: t.amountCents,
    date: toISO(t.date),
    categoryId: t.categoryId,
    categoryName: t.category.name,
    categoryIcon: t.category.icon,
    accountId: t.accountId,
    accountName: t.account.name,
    cardId: t.cardId,
    fromInstallment: t.debtId !== null,
  };
}
