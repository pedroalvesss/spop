"use client";

import { useOptimistic, useTransition } from "react";
import { postDebtPayment } from "@/actions/dividasActions/postDebtPayment";
import { Money, Private } from "@/components/HideValues";
import { IconBox } from "@/components/ListRow";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { debtEndLabel, paymentToast, remainingCents, remainingInstallments } from "@/lib/debts";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { DebtDto } from "@/services/dividasService/getDebts";

interface DebtCardProps {
  debt: DebtDto;
  currentMonth: string;
  onEdit: (debt: DebtDto) => void;
}

export function DebtCard({ debt: saved, currentMonth, onEdit }: DebtCardProps) {
  const toast = useToast();
  const [paid, setOptimisticPaid] = useOptimistic(saved.paidInstallments);
  const [, startTransition] = useTransition();
  const debt = { ...saved, paidInstallments: paid };
  const left = remainingInstallments(debt);
  const done = left === 0;

  function handleClickPayButton() {
    startTransition(async () => {
      setOptimisticPaid(paid + 1);
      toast(paymentToast(debt.name, left - 1));
      await postDebtPayment(debt.id);
    });
  }

  function handleClickDebtButton() {
    onEdit(saved);
  }

  return (
    <Card className="gap-3">
      <button
        type="button"
        onClick={handleClickDebtButton}
        className="flex items-center gap-2.5 text-left"
      >
        <IconBox icon={debt.icon} />
        <div className="min-w-0 flex-1">
          <div className="text-sm">{debt.name}</div>
          <div className="text-xs text-neutral-500">{debt.subtitle}</div>
        </div>
        {!done && (
          <span className="text-sm tabular-nums">
            <Money cents={remainingCents(debt)} />
          </span>
        )}
      </button>
      <div
        className="flex gap-[3px]"
        aria-label={`${paid} de ${debt.totalInstallments} parcelas pagas`}
      >
        {Array.from({ length: debt.totalInstallments }, (_, i) => (
          <div
            key={i}
            data-testid="installment"
            className={cn("h-1.5 flex-1 rounded-[3px]", i < paid ? "bg-accent" : "bg-bg")}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>
          {done ? (
            `${debt.totalInstallments} de ${debt.totalInstallments} pagas`
          ) : (
            <>
              {paid} de {debt.totalInstallments} ·{" "}
              <Private fallback="R$ ••••">{formatBRL(debt.installmentCents)}</Private>/mês · acaba{" "}
              {debtEndLabel(debt, currentMonth)}
            </>
          )}
        </span>
        {done ? (
          <Tag tone="accent">Quitada</Tag>
        ) : (
          <Button variant="ghost" className="text-[13px]" onClick={handleClickPayButton}>
            Pagar parcela
          </Button>
        )}
      </div>
    </Card>
  );
}
