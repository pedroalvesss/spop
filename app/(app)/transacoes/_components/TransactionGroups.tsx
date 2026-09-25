import { Money } from "@/components/HideValues";
import { Card } from "@/components/ui/card";
import type { DayGroup } from "@/lib/transactions";
import type { TransactionDto } from "@/services/transacoesService/transactionDto";
import { TransactionRow } from "../../_components/TransactionRow";

interface TransactionGroupsProps {
  groups: DayGroup<TransactionDto>[];
}

// Um card por dia: rótulo em caixa alta com o total do dia à direita.
export function TransactionGroups({ groups }: TransactionGroupsProps) {
  return groups.map((group) => (
    <section key={group.date} className="flex flex-col gap-1.5">
      <div className="flex justify-between px-1 text-xs tracking-[0.06em] text-neutral-500 uppercase">
        <span>{group.label}</span>
        <span className="tabular-nums">
          <Money cents={group.totalCents} signed hiddenText="" />
        </span>
      </div>
      <Card className="gap-0 px-4 py-1">
        {group.items.map((t) => (
          <TransactionRow
            key={t.id}
            transaction={t}
            meta={`${t.categoryName} · ${t.accountName}`}
            className="py-2.5"
          />
        ))}
      </Card>
    </section>
  ));
}
