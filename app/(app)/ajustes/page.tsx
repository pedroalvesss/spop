import type { Metadata } from "next";
import { Card, CardGrid } from "@/components/ui/card";
import { todayISO } from "@/lib/dates";
import { pluggyEnabled } from "@/lib/pluggy";
import { getAccountsWithBalance } from "@/services/bancosService/getAccountsWithBalance";
import { getBankConnection } from "@/services/bancosService/getBankConnection";
import { getActiveCards } from "@/services/cartoesService/getActiveCards";
import { getActiveCategories } from "@/services/categoriasService/getActiveCategories";
import { getCurrentUser } from "@/services/usuariosService/getCurrentUser";
import { AccountsCard } from "./_components/AccountsCard";
import { BankConnectionCard } from "./_components/BankConnectionCard";
import { CategoriesCard } from "./_components/CategoriesCard";
import { ModulesCard } from "./_components/ModulesCard";
import { NotificationsCard } from "./_components/NotificationsCard";
import { PreferencesCard } from "./_components/PreferencesCard";

export const metadata: Metadata = { title: "Ajustes · SPOP!" };

export default async function SettingsPage() {
  const bank = pluggyEnabled();
  const [user, accounts, categories, cards, connection] = await Promise.all([
    getCurrentUser(),
    getAccountsWithBalance(),
    getActiveCategories(),
    bank ? getActiveCards() : [],
    bank ? getBankConnection() : null,
  ]);

  return (
    <CardGrid className="items-start">
      <div className="flex flex-col gap-3.5">
        <Card className="flex-row items-center gap-3 p-[18px]">
          <div className="grid size-[52px] shrink-0 place-items-center rounded-full bg-accent-800 text-xl font-semibold text-accent-200">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base">{user.name}</div>
            <div className="truncate text-[13px] text-neutral-500">{user.email}</div>
          </div>
        </Card>
        <AccountsCard
          accounts={accounts.map(({ id, name, color, active, balanceCents }) => ({
            id,
            name,
            color,
            active,
            balanceCents,
          }))}
        />
        <CategoriesCard categories={categories} />
      </div>
      <div className="flex flex-col gap-3.5">
        <ModulesCard modules={user.modules} />
        {bank && (
          <BankConnectionCard
            connection={connection}
            accounts={accounts.filter((a) => a.active).map(({ id, name }) => ({ id, name }))}
            cards={cards}
            today={todayISO()}
          />
        )}
        <NotificationsCard emailReminders={user.emailReminders} />
        <PreferencesCard
          hideValuesOnOpen={user.hideValuesOnOpen}
          billCreatesTransaction={user.billCreatesTransaction}
          salaryDay={user.salaryDay}
        />
      </div>
    </CardGrid>
  );
}
