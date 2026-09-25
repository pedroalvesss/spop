import { Money } from "@/components/HideValues";
import { Card } from "@/components/ui/card";
import { chartBars, flowStats, type MonthFlow } from "@/lib/reports";
import { cn } from "@/lib/utils";

interface FlowChartCardProps {
  flows: MonthFlow[];
}

// Barras duplas por mês (até 14px cada, área de 140px). O mês atual tem rótulo em texto normal.
export function FlowChartCard({ flows }: FlowChartCardProps) {
  const bars = chartBars(flows);
  const stats = flowStats(flows);

  return (
    <Card className="gap-3.5 p-[18px]">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-medium">Entrou × saiu</span>
        <span className="flex gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-[5px]">
            <span className="size-2 rounded-[2px] bg-income" />
            Entrou
          </span>
          <span className="flex items-center gap-[5px]">
            <span className="size-2 rounded-[2px] bg-expense" />
            Saiu
          </span>
        </span>
      </div>
      <div
        className="flex h-40 items-end gap-1.5"
        role="img"
        aria-label="Entradas e saídas por mês"
      >
        {bars.map((bar, i) => (
          <div key={bar.month} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div className="flex h-[140px] w-full items-end justify-center gap-0.5">
              <div
                data-testid="income-bar"
                className="w-[40%] max-w-3.5 rounded-t-[3px] bg-income"
                style={{ height: bar.incomePx }}
              />
              <div
                data-testid="expense-bar"
                className="w-[40%] max-w-3.5 rounded-t-[3px] bg-expense"
                style={{ height: bar.expensePx }}
              />
            </div>
            <span
              className={cn(
                "text-[11px]",
                i === bars.length - 1 ? "text-text" : "text-neutral-500",
              )}
            >
              {bar.label}
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500">Média de gastos</span>
          <span className="text-base tabular-nums">
            <Money cents={stats.avgExpenseCents} />
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500">Mês mais salgado</span>
          <span className="text-base">
            {stats.worstLabel} · <Money cents={stats.worstCents} />
          </span>
        </div>
      </div>
    </Card>
  );
}
