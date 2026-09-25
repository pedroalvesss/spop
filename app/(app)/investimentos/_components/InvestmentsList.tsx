"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react/ssr";
import { Money } from "@/components/HideValues";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { allocationColor } from "@/lib/investments";
import { cn } from "@/lib/utils";
import type { InvestmentDto } from "@/services/investimentosService/getInvestments";
import { InvestmentForm } from "./InvestmentForm";

interface InvestmentRowProps {
  investment: InvestmentDto;
  index: number;
  pct: string;
  onEdit: (investment: InvestmentDto) => void;
}

function InvestmentRow({ investment, index, pct, onEdit }: InvestmentRowProps) {
  function handleClickRow() {
    onEdit(investment);
  }

  return (
    <button
      type="button"
      onClick={handleClickRow}
      className="flex items-center gap-3 py-3 text-left"
    >
      <span className={cn("size-2.5 shrink-0 rounded-[3px]", allocationColor(index))} />
      <div className="min-w-0 flex-1">
        <div className="text-sm">{investment.name}</div>
        <div className="text-xs text-neutral-500">{investment.subtitle}</div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm tabular-nums">
          <Money cents={investment.amountCents} />
        </span>
        <span className="text-xs text-neutral-500">{pct}</span>
      </div>
    </button>
  );
}

interface InvestmentsListProps {
  investments: InvestmentDto[];
  totalCents: number;
}

export function InvestmentsList({ investments, totalCents }: InvestmentsListProps) {
  const [editor, setEditor] = useState({
    open: false,
    investment: null as InvestmentDto | null,
    key: 0,
  });

  function handleEditRow(investment: InvestmentDto) {
    setEditor((e) => ({ open: true, investment, key: e.key + 1 }));
  }

  function handleClickAddButton() {
    setEditor((e) => ({ open: true, investment: null, key: e.key + 1 }));
  }

  function handleOpenChange(open: boolean) {
    setEditor((e) => ({ ...e, open }));
  }

  return (
    <div className="flex flex-col gap-3.5">
      {investments.length > 0 && (
        <Card className="gap-0 px-4 py-1">
          {investments.map((inv, i) => (
            <InvestmentRow
              key={inv.id}
              investment={inv}
              index={i}
              pct={`${totalCents > 0 ? Math.round((inv.amountCents / totalCents) * 100) : 0}%`}
              onEdit={handleEditRow}
            />
          ))}
        </Card>
      )}
      <Button variant="secondary" className="min-h-11 rounded-xl" onClick={handleClickAddButton}>
        <Plus />
        Adicionar investimento
      </Button>
      <InvestmentForm
        key={editor.key}
        investment={editor.investment}
        open={editor.open}
        onOpenChange={handleOpenChange}
      />
    </div>
  );
}
