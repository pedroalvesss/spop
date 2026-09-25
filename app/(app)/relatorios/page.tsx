import type { Metadata } from "next";
import { CardGrid } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { monthKey, monthName, todayISO } from "@/lib/dates";
import { parsePeriod, PERIODS } from "@/lib/reports";
import { getCategoryBreakdown } from "@/services/relatoriosService/getCategoryBreakdown";
import { getMonthlyFlows } from "@/services/relatoriosService/getMonthlyFlows";
import { requireModule } from "@/services/usuariosService/getCurrentUser";
import { CategoryBreakdownCard } from "./_components/CategoryBreakdownCard";
import { FlowChartCard } from "./_components/FlowChartCard";

export const metadata: Metadata = { title: "Relatórios · SPOP!" };

export default async function ReportsPage({ searchParams }: PageProps<"/relatorios">) {
  await requireModule("reports");
  const period = parsePeriod((await searchParams).periodo);
  const month = monthKey(todayISO());
  const [flows, slices] = await Promise.all([
    getMonthlyFlows(month, period),
    getCategoryBreakdown(month),
  ]);

  return (
    <div className="flex flex-col gap-3.5">
      <Segmented
        label="Período"
        value={String(period)}
        className="max-w-[320px]"
        options={PERIODS.map((p) => ({
          value: String(p),
          label: `${p} meses`,
          href: `/relatorios?periodo=${p}`,
        }))}
      />
      <CardGrid className="items-start">
        <FlowChartCard flows={flows} />
        <CategoryBreakdownCard monthName={monthName(month)} slices={slices} />
      </CardGrid>
    </div>
  );
}
