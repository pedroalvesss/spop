import { after } from "next/server";
import { HideValuesProvider } from "@/components/HideValues";
import { syncBankIfStale } from "@/lib/bankSync";
import { daysUntilDay, longDate, salaryLine, todayISO } from "@/lib/dates";
import { getUserId } from "@/lib/session";
import { getActiveAccounts } from "@/services/bancosService/getActiveAccounts";
import { getActiveCards } from "@/services/cartoesService/getActiveCards";
import { getActiveCategories } from "@/services/categoriasService/getActiveCategories";
import { getCurrentUser } from "@/services/usuariosService/getCurrentUser";
import { AppHeader } from "./_components/AppHeader";
import { Sidebar } from "./_components/Sidebar";
import { TabBar } from "./_components/TabBar";
import { TransactionDialogProvider } from "./_contexts/TransactionDialogContext";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [user, accounts, categories, cards] = await Promise.all([
    getCurrentUser(),
    getActiveAccounts(),
    getActiveCategories(),
    getActiveCards(),
  ]);
  // Abrir o app puxa o que o banco tiver de novo, depois da resposta.
  const userId = await getUserId();
  after(() => syncBankIfStale(userId));
  const today = todayISO();
  const salary = salaryLine(daysUntilDay(today, user.salaryDay));
  const homeSub = `${longDate(today)} · ${salary.charAt(0).toLowerCase()}${salary.slice(1)}`;

  return (
    <HideValuesProvider initialHidden={user.hideValuesOnOpen}>
      <TransactionDialogProvider options={{ accounts, cards, categories }}>
        <div className="flex min-h-dvh">
          <Sidebar userName={user.name} modules={user.modules} />
          <main className="min-w-0 flex-1">
            <div className="mx-auto flex max-w-[1180px] flex-col gap-[18px] px-4 pt-[max(14px,env(safe-area-inset-top))] pb-[120px] pc:px-8 pc:pt-7 pc:pb-12">
              <AppHeader userName={user.name} homeSub={homeSub} />
              {children}
            </div>
          </main>
        </div>
        <TabBar modules={user.modules} />
      </TransactionDialogProvider>
    </HideValuesProvider>
  );
}
