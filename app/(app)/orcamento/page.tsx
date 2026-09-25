import type { Metadata } from "next";
import { Money, Private } from "@/components/HideValues";
import { Card, CardGrid } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { buildBudgetRows } from "@/lib/budget";
import { daysLeftInMonth, monthKey, monthName, todayISO } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { getActiveCategories } from "@/services/categoriasService/getActiveCategories";
import { getMonthTotals } from "@/services/transacoesService/getMonthTotals";
import { requireModule } from "@/services/usuariosService/getCurrentUser";
import { BudgetList } from "./_components/BudgetList";

export const metadata: Metadata = { title: "Orçamento · SPOP!" };

export default async function BudgetPage() {
  await requireModule("budget");
  const today = todayISO();
  const month = monthKey(today);
  const [categories, totals] = await Promise.all([getActiveCategories(), getMonthTotals(month)]);
  const rows = buildBudgetRows(categories, totals.spentByCategory);
  const budgetTotal = rows.reduce((a, r) => a + r.budgetCents, 0);
  const left = Math.max(0, budgetTotal - totals.expenseCents);
  const days = daysLeftInMonth(today);

  return (
    <CardGrid>
      <Card className="col-span-full gap-3 p-5">
        <div className="text-[13px] text-neutral-400">Gasto em {monthName(month)}</div>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[34px] font-medium tracking-[-0.03em] tabular-nums">
            <Money cents={totals.expenseCents} />
          </span>
          <span className="text-sm text-neutral-500">
            de <Money cents={budgetTotal} />
          </span>
        </div>
        <ProgressBar
          ratio={budgetTotal > 0 ? totals.expenseCents / budgetTotal : 0}
          className="h-2 rounded-[4px]"
        />
        <div className="text-xs text-neutral-400">
          <Private>
            Sobram {formatBRL(left)} pra {days} {days === 1 ? "dia" : "dias"}. Dá{" "}
            {formatBRL(Math.round(left / days))} por dia.
          </Private>
        </div>
      </Card>
      <BudgetList rows={rows} />
    </CardGrid>
  );
}
