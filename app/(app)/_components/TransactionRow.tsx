"use client";

import { Money } from "@/components/HideValues";
import { ListRow } from "@/components/ListRow";
import { cn } from "@/lib/utils";
import type { TransactionDto } from "@/services/transacoesService/transactionDto";
import { useTransactionDialog } from "../_contexts/TransactionDialogContext";

interface TransactionRowProps {
  transaction: TransactionDto;
  meta: string;
  className?: string;
}

// Tocar no lançamento abre o mesmo modal, em modo edição.
export function TransactionRow({ transaction, meta, className }: TransactionRowProps) {
  const { openEdit } = useTransactionDialog();

  function handleClickRow() {
    openEdit({
      id: transaction.id,
      amountCents: transaction.amountCents,
      description: transaction.description,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId,
      cardId: transaction.cardId,
      date: transaction.date,
      fromInstallment: transaction.fromInstallment,
    });
  }

  return (
    <ListRow
      icon={transaction.categoryIcon}
      title={transaction.description}
      meta={meta}
      value={<Money cents={transaction.amountCents} signed hiddenText="••••" />}
      valueClassName={cn("font-medium", transaction.amountCents > 0 && "text-income")}
      className={className}
      onClick={handleClickRow}
    />
  );
}
