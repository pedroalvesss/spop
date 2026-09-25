import { Card, CardHeader } from "@/components/ui/card";
import { shortDate } from "@/lib/dates";
import type { TransactionDto } from "@/services/transacoesService/transactionDto";
import { TransactionRow } from "../../_components/TransactionRow";

interface RecentTransactionsCardProps {
  transactions: TransactionDto[];
}

export function RecentTransactionsCard({ transactions }: RecentTransactionsCardProps) {
  return (
    <Card className="gap-1">
      <CardHeader title="Últimos lançamentos" href="/transacoes" linkLabel="Ver todos" />
      {transactions.map((t) => (
        <TransactionRow
          key={t.id}
          transaction={t}
          meta={`${shortDate(t.date)} · ${t.categoryName}`}
        />
      ))}
      {transactions.length === 0 && (
        <p className="py-2 text-[13px] text-neutral-500">
          Nenhum lançamento ainda. O + ali embaixo resolve isso.
        </p>
      )}
    </Card>
  );
}
