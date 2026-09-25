import { CardGrid } from "@/components/ui/card";
import { buildBudgetRows, budgetInsight } from "@/lib/budget";
import { daysUntilDay, monthKey, monthName, salaryLine, todayISO } from "@/lib/dates";
import { getAccountsWithBalance } from "@/services/bancosService/getAccountsWithBalance";
import { getActiveCategories } from "@/services/categoriasService/getActiveCategories";
import { getMonthTotals } from "@/services/transacoesService/getMonthTotals";
import { getRecentTransactions } from "@/services/transacoesService/getRecentTransactions";
import { getCurrentUser } from "@/services/usuariosService/getCurrentUser";
import { BalanceCard } from "./_components/BalanceCard";
import { InsightCard } from "./_components/InsightCard";
import { RecentTransactionsCard } from "./_components/RecentTransactionsCard";

export default async function HomePage() {
  const today = todayISO();
  const month = monthKey(today);
  const [user, accounts, totals, categories, recent] = await Promise.all([
    getCurrentUser(),
    getAccountsWithBalance(),
    getMonthTotals(month),
    getActiveCategories(),
    getRecentTransactions(5),
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
      {modules.has("tx") && <RecentTransactionsCard transactions={recent} />}
    </CardGrid>
  );
}
