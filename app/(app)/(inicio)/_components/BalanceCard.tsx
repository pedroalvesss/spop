import { ArrowDownLeft, ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Balance, Money, Private } from "@/components/HideValues";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { formatBRL } from "@/lib/money";

interface BalanceCardProps {
  accounts: { id: string; name: string; color: string; balanceCents: number }[];
  incomeCents: number;
  expenseCents: number;
  monthName: string;
  salaryText: string;
}

export function BalanceCard({
  accounts,
  incomeCents,
  expenseCents,
  monthName,
  salaryText,
}: BalanceCardProps) {
  const total = accounts.reduce((a, acc) => a + acc.balanceCents, 0);
  const spentRatio = incomeCents > 0 ? expenseCents / incomeCents : expenseCents > 0 ? 1 : 0;
  const left = incomeCents - expenseCents;

  return (
    <Card className="col-span-full gap-3.5 p-5">
      <div className="flex items-center justify-between text-[13px] text-neutral-400">
        <span>Saldo total</span>
        <span className="pc:hidden">{salaryText}</span>
      </div>
      <div className="text-[44px] leading-none font-medium tracking-[-0.035em] tabular-nums">
        <Balance cents={total} />
      </div>
      <div className="flex flex-wrap gap-2">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="flex items-center gap-2 rounded-[10px] bg-bg px-2.5 py-1.5 text-[13px]"
          >
            <span className="size-2 rounded-full" style={{ background: acc.color }} />
            <span className="text-neutral-400">{acc.name}</span>
            <span className="tabular-nums">
              <Money cents={acc.balanceCents} />
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            <ArrowDownLeft className="text-income" />
            Entrou em {monthName}
          </span>
          <span className="text-lg font-medium tabular-nums">
            <Money cents={incomeCents} />
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            <ArrowUpRight className="text-expense" />
            Saiu em {monthName}
          </span>
          <span className="text-lg font-medium tabular-nums">
            <Money cents={expenseCents} />
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <ProgressBar ratio={spentRatio} />
        <div className="text-xs text-neutral-400">
          <Private fallback="Valores ocultos">
            {left >= 0
              ? `Sobraram ${formatBRL(left)} do que entrou. Por enquanto.`
              : `Saiu ${formatBRL(-left)} a mais do que entrou. Eita.`}
          </Private>
        </div>
      </div>
    </Card>
  );
}
