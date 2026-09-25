import type { Metadata } from "next";
import { Money } from "@/components/HideValues";
import { Card, CardGrid } from "@/components/ui/card";
import { monthKey, todayISO } from "@/lib/dates";
import { debtsSummary } from "@/lib/debts";
import { getActiveAccounts } from "@/services/bancosService/getActiveAccounts";
import { getDebts } from "@/services/dividasService/getDebts";
import { requireModule } from "@/services/usuariosService/getCurrentUser";
import { DebtsList } from "./_components/DebtsList";

export const metadata: Metadata = { title: "Dívidas · SPOP!" };

export default async function DebtsPage() {
  await requireModule("debts");
  const currentMonth = monthKey(todayISO());
  const [debts, accounts] = await Promise.all([getDebts(), getActiveAccounts()]);
  const { totalCents, freeLine } = debtsSummary(debts, currentMonth);

  return (
    <CardGrid>
      <Card className="col-span-full gap-1.5 p-5">
        <span className="text-[13px] text-neutral-400">Ainda devo</span>
        <span className="text-[34px] font-medium tracking-[-0.03em] tabular-nums">
          <Money cents={totalCents} />
        </span>
        <span className="text-[13px] text-neutral-400">{freeLine}</span>
      </Card>
      <DebtsList debts={debts} currentMonth={currentMonth} accounts={accounts} />
    </CardGrid>
  );
}
