"use client";

import { Money, Private } from "@/components/HideValues";
import { IconBox } from "@/components/ListRow";
import { budgetTone, ProgressBar } from "@/components/ui/progress";
import { Tag } from "@/components/ui/tag";
import { budgetStatus, type BudgetRow } from "@/lib/budget";
import { formatBRL } from "@/lib/money";

interface BudgetCategoryCardProps {
  row: BudgetRow;
  onEdit: (row: BudgetRow) => void;
}

export function BudgetCategoryCard({ row, onEdit }: BudgetCategoryCardProps) {
  const status = budgetStatus(row.ratio);
  const diff = row.budgetCents - row.spentCents;

  function handleClickCard() {
    onEdit(row);
  }

  return (
    <button
      type="button"
      onClick={handleClickCard}
      aria-label={`Editar orçamento de ${row.name}`}
      className="flex flex-col gap-2.5 rounded-2xl bg-surface p-4 text-left"
    >
      <div className="flex w-full items-center gap-2.5">
        <IconBox icon={row.icon} className="size-9" />
        <span className="flex-1 text-sm">{row.name}</span>
        {status === "over" && <Tag tone="expense">Estourou</Tag>}
        {status === "near" && <Tag tone="warn">Quase lá</Tag>}
      </div>
      <ProgressBar ratio={row.ratio} fillClassName={budgetTone(row.ratio)} className="w-full" />
      <div className="flex w-full justify-between text-xs text-neutral-400 tabular-nums">
        <span>
          <Money cents={row.spentCents} /> de <Money cents={row.budgetCents} />
        </span>
        <Private>
          <span>{diff < 0 ? `${formatBRL(-diff)} acima` : `sobram ${formatBRL(diff)}`}</span>
        </Private>
      </div>
    </button>
  );
}
