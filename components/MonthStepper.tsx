import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/ssr";
import { addMonths, MONTHS_SHORT } from "@/lib/dates";

const STEP =
  "grid size-8 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-text/7";

interface MonthStepperProps {
  month: string;
  currentMonth: string;
  hrefFor: (month: string) => string;
}

// Filtro por mês: setas pros lados, sem passar do mês atual.
export function MonthStepper({ month, currentMonth, hrefFor }: MonthStepperProps) {
  const label = `${MONTHS_SHORT[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;
  const next = addMonths(month, 1);
  return (
    <div className="flex items-center gap-1 text-[13px]">
      <Link href={hrefFor(addMonths(month, -1))} replace aria-label="Mês anterior" className={STEP}>
        <CaretLeft />
      </Link>
      <span className="min-w-[68px] text-center">{label}</span>
      {next <= currentMonth ? (
        <Link href={hrefFor(next)} replace aria-label="Próximo mês" className={STEP}>
          <CaretRight />
        </Link>
      ) : (
        <span aria-hidden="true" className="size-8" />
      )}
    </div>
  );
}
