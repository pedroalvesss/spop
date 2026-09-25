import { TrendUp } from "@phosphor-icons/react/ssr";
import { Money, Private } from "@/components/HideValues";
import { Card } from "@/components/ui/card";
import { allocationColor, yieldLine } from "@/lib/investments";
import { cn } from "@/lib/utils";

interface InvestmentSummaryProps {
  totalCents: number;
  yieldCents: number;
  amounts: { id: string; amountCents: number }[];
}

export function InvestmentSummary({ totalCents, yieldCents, amounts }: InvestmentSummaryProps) {
  return (
    <Card className="gap-3 p-5">
      <span className="text-[13px] text-neutral-400">Patrimônio investido</span>
      <span className="text-[34px] font-medium tracking-[-0.03em] tabular-nums">
        <Money cents={totalCents} />
      </span>
      <span
        className={cn(
          "flex items-center gap-1 text-[13px]",
          yieldCents > 0 ? "text-income" : "text-neutral-400",
        )}
      >
        <TrendUp className="shrink-0" />
        <Private fallback="Rendimento oculto">{yieldLine(yieldCents)}</Private>
      </span>
      <div className="mt-1.5 flex h-2.5 gap-0.5 overflow-hidden rounded-[5px]">
        {amounts.map((inv, i) => (
          <div
            key={inv.id}
            data-testid="allocation"
            className={cn("h-full", allocationColor(i))}
            style={{ width: `${totalCents > 0 ? (inv.amountCents / totalCents) * 100 : 0}%` }}
          />
        ))}
      </div>
    </Card>
  );
}
