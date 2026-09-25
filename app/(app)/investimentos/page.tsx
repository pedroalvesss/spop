import type { Metadata } from "next";
import { CardGrid } from "@/components/ui/card";
import { monthKey, todayISO } from "@/lib/dates";
import { monthYield } from "@/lib/investments";
import { getInvestments } from "@/services/investimentosService/getInvestments";
import { requireModule } from "@/services/usuariosService/getCurrentUser";
import { InvestmentSummary } from "./_components/InvestmentSummary";
import { InvestmentsList } from "./_components/InvestmentsList";

export const metadata: Metadata = { title: "Investimentos · SPOP!" };

export default async function InvestmentsPage() {
  await requireModule("invest");
  const investments = await getInvestments();
  const totalCents = investments.reduce((a, i) => a + i.amountCents, 0);

  return (
    <CardGrid className="items-start">
      <InvestmentSummary
        totalCents={totalCents}
        yieldCents={monthYield(investments, monthKey(todayISO()))}
        amounts={investments}
      />
      <InvestmentsList investments={investments} totalCents={totalCents} />
    </CardGrid>
  );
}
