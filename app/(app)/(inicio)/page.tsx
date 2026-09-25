import { CardGrid } from "@/components/ui/card";
import { buildBudgetRows, budgetInsight } from "@/lib/budget";
import { daysUntilDay, monthKey, monthName, salaryLine, todayISO } from "@/lib/dates";
import { getAccountsWithBalance } from "@/services/bancosService/getAccountsWithBalance";
import { getBillsForMonth } from "@/services/contasPagarService/getBillsForMonth";
import { getActiveCategories } from "@/services/categoriasService/getActiveCategories";
import { getGoals } from "@/services/metasService/getGoals";
import { getMonthTotals } from "@/services/transacoesService/getMonthTotals";
import { getRecentTransactions } from "@/services/transacoesService/getRecentTransactions";
import { getCurrentUser } from "@/services/usuariosService/getCurrentUser";
import { BalanceCard } from "./_components/BalanceCard";
import { GoalsCard } from "./_components/GoalsCard";
import { InsightCard } from "./_components/InsightCard";
import { NextBillsCard } from "./_components/NextBillsCard";
import { RecentTransactionsCard } from "./_components/RecentTransactionsCard";

export default async function HomePage() {
  const today = todayISO();
  const month = monthKey(today);
  const [user, accounts, totals, categories, recent, bills, goals] = await Promise.all([
    getCurrentUser(),
    getAccountsWithBalance(),
    getMonthTotals(month),
    getActiveCategories(),
    getRecentTransactions(5),
    getBillsForMonth(month),
    getGoals(),
  ]);
  const insight = budgetInsight(buildBudgetRows(categories, totals.spentByCategory));
  const modules = new Set(user.modules);

  return (
    <CardGrid>
      <BalanceCard
        accounts={accounts.filter((a) => a.active)}
        incomeCents={totals.incomeCents}
        expenseCents={totals.expenseCents}
        monthName={monthName(month)}
        salaryText={salaryLine(daysUntilDay(today, user.salaryDay))}
      />
      <InsightCard insight={insight} />
      {modules.has("bills") && <NextBillsCard bills={bills} today={today} />}
      {modules.has("tx") && <RecentTransactionsCard transactions={recent} />}
      {modules.has("goals") && <GoalsCard goals={goals} />}
    </CardGrid>
  );
}
