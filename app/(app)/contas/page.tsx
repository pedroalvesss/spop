import type { Metadata } from "next";
import { Money } from "@/components/HideValues";
import { Card } from "@/components/ui/card";
import { billTotals } from "@/lib/bills";
import { monthKey, todayISO } from "@/lib/dates";
import { getActiveAccounts } from "@/services/bancosService/getActiveAccounts";
import { getActiveCategories } from "@/services/categoriasService/getActiveCategories";
import { getBillsForMonth } from "@/services/contasPagarService/getBillsForMonth";
import { requireModule } from "@/services/usuariosService/getCurrentUser";
import { BillsList } from "./_components/BillsList";

export const metadata: Metadata = { title: "Contas a pagar · SPOP!" };

export default async function BillsPage() {
  await requireModule("bills");
  const today = todayISO();
  const [bills, categories, accounts] = await Promise.all([
    getBillsForMonth(monthKey(today)),
    getActiveCategories(),
    getActiveAccounts(),
  ]);
  const { pendingCents, paidCents } = billTotals(bills);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
        <Card className="gap-0.5">
          <span className="text-xs text-neutral-400">Falta pagar</span>
          <span className="text-2xl font-medium tabular-nums">
            <Money cents={pendingCents} />
          </span>
        </Card>
        <Card className="gap-0.5">
          <span className="text-xs text-neutral-400">Já pago</span>
          <span className="text-2xl font-medium text-neutral-300 tabular-nums">
            <Money cents={paidCents} />
          </span>
        </Card>
      </div>
      <BillsList bills={bills} today={today} options={{ categories, accounts }} />
    </div>
  );
}
