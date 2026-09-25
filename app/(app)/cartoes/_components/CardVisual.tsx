import { ContactlessPayment } from "@phosphor-icons/react/ssr";
import { Money } from "@/components/HideValues";

interface CardVisualProps {
  name: string;
  last4: string;
  invoiceCents: number;
}

// Proporção de cartão de verdade (1,586), accent-900 com contorno interno accent-700.
export function CardVisual({ name, last4, invoiceCents }: CardVisualProps) {
  return (
    <div className="flex aspect-[1.586] w-full max-w-[380px] flex-col justify-between rounded-[18px] bg-accent-900 p-5 text-left shadow-[inset_0_0_0_1px_var(--color-accent-700)]">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-medium">{name}</span>
        <ContactlessPayment className="text-[22px] text-accent-300" />
      </div>
      <div className="h-7 w-[38px] rounded-md bg-accent-700" />
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-accent-300">Fatura atual</span>
          <span className="text-[22px] font-medium tabular-nums">
            <Money cents={invoiceCents} />
          </span>
        </div>
        <span className="text-[13px] tracking-[0.1em] text-accent-300">•••• {last4}</span>
      </div>
    </div>
  );
}
