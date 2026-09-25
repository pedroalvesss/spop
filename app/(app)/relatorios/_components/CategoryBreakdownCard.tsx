import { Money } from "@/components/HideValues";
import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import type { CategorySlice } from "@/services/relatoriosService/getCategoryBreakdown";

interface CategoryBreakdownCardProps {
  monthName: string;
  slices: CategorySlice[];
}

export function CategoryBreakdownCard({ monthName, slices }: CategoryBreakdownCardProps) {
  return (
    <Card className="gap-3 p-[18px]">
      <span className="text-[15px] font-medium">Pra onde foi ({monthName})</span>
      {slices.map((slice) => (
        <div key={slice.id} className="flex flex-col gap-[5px]">
          <div className="flex justify-between text-[13px]">
            <span className="flex items-center gap-1.5">
              <Icon name={slice.icon} className="text-neutral-400" />
              {slice.name}
            </span>
            <span className="text-neutral-300 tabular-nums">
              <Money cents={slice.spentCents} /> · {Math.round(slice.share * 100)}%
            </span>
          </div>
          <ProgressBar ratio={slice.share} fillClassName="bg-accent-500" />
        </div>
      ))}
      {slices.length === 0 && (
        <p className="text-[13px] text-neutral-500">
          Nenhuma saída este mês. Anota isso num quadro.
        </p>
      )}
    </Card>
  );
}
