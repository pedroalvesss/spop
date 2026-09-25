import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

interface AmountFieldProps {
  field: UseFormRegisterReturn;
  income: boolean;
}

// Valor grande no centro do modal, sem borda. Aceita "1.234,56".
export function AmountField({ field, income }: AmountFieldProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-2.5">
      <label htmlFor="tx-amount" className="text-xs text-neutral-500">
        Valor
      </label>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[22px] text-neutral-500">R$</span>
        <input
          id="tx-amount"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          className={cn(
            "caret-accent w-[200px] bg-transparent text-center text-[44px] font-medium tracking-[-0.03em] outline-none focus-visible:outline-none",
            income ? "text-income" : "text-text",
          )}
          {...field}
        />
      </div>
    </div>
  );
}
