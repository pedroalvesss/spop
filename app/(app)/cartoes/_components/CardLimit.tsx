import { Money } from "@/components/HideValues";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { shortDate } from "@/lib/dates";

interface CardLimitProps {
  usedCents: number;
  limitCents: number;
  closingDate: string;
  dueDate: string;
}

export function CardLimit({ usedCents, limitCents, closingDate, dueDate }: CardLimitProps) {
  return (
    <Card className="gap-2.5">
      <div className="flex justify-between text-[13px]">
        <span className="text-neutral-400">Limite usado</span>
        <span className="tabular-nums">
          <Money cents={usedCents} /> de <Money cents={limitCents} />
        </span>
      </div>
      <ProgressBar ratio={limitCents > 0 ? usedCents / limitCents : 0} />
      <div className="mt-1 grid grid-cols-2 gap-2.5">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500">Fecha</span>
          <span className="text-[15px]">{shortDate(closingDate, true)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500">Vence</span>
          <span className="text-[15px]">{shortDate(dueDate, true)}</span>
        </div>
      </div>
    </Card>
  );
}
