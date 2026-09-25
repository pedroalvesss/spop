"use client";

import { useOptimistic, useTransition } from "react";
import { Check } from "@phosphor-icons/react/ssr";
import { postBillPayment } from "@/actions/contasPagarActions/postBillPayment";
import { Money } from "@/components/HideValues";
import { IconBox } from "@/components/ListRow";
import { useToast } from "@/components/Toast";
import { billStatus, type BillView } from "@/lib/bills";
import { cn } from "@/lib/utils";

interface BillRowProps {
  bill: BillView;
  today: string;
  onEdit: (bill: BillView) => void;
}

export function BillRow({ bill, today, onEdit }: BillRowProps) {
  const toast = useToast();
  const [paid, setOptimisticPaid] = useOptimistic(bill.paid);
  const [, startTransition] = useTransition();
  const status = billStatus({ paid, dueDate: bill.dueDate }, today);

  function handleClickCheckButton() {
    startTransition(async () => {
      setOptimisticPaid(!paid);
      if (!paid) toast(`${bill.name}: paga. Menos um boleto na vida.`);
      await postBillPayment(bill.id);
    });
  }

  function handleClickBillButton() {
    onEdit(bill);
  }

  return (
    <div className="flex items-center gap-3 py-2.5">
      <button
        type="button"
        title="Marcar como paga"
        aria-label={`Marcar ${bill.name} como paga`}
        aria-pressed={paid}
        onClick={handleClickCheckButton}
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full text-bg transition-colors",
          paid
            ? "bg-accent shadow-[inset_0_0_0_1.5px_var(--color-accent)]"
            : "shadow-[inset_0_0_0_1.5px_var(--color-neutral-600)]",
        )}
      >
        {paid && <Check weight="bold" className="text-[15px]" />}
      </button>
      <button
        type="button"
        onClick={handleClickBillButton}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <IconBox icon={bill.icon} />
        <div className="min-w-0 flex-1">
          <div className={cn("truncate text-sm", paid && "opacity-50")}>{bill.name}</div>
          <div className={cn("text-xs", status.warn ? "text-warn" : "text-neutral-500")}>
            {status.text}
          </div>
        </div>
        <div className={cn("text-sm tabular-nums", paid && "opacity-50")}>
          <Money cents={bill.amountCents} />
        </div>
      </button>
    </div>
  );
}
