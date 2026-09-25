import { cn } from "@/lib/utils";

// Cor do orçamento: warn a partir de 85%, expense acima de 100%.
export function budgetTone(ratio: number) {
  if (ratio > 1) return "bg-expense";
  if (ratio >= 0.85) return "bg-warn";
  return "bg-accent";
}

interface ProgressBarProps {
  ratio: number;
  fillClassName?: string;
  className?: string;
}

export function ProgressBar({ ratio, fillClassName = "bg-accent", className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, ratio * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 overflow-hidden rounded-[3px] bg-bg", className)}
    >
      <div className={cn("h-full rounded-[inherit]", fillClassName)} style={{ width: `${pct}%` }} />
    </div>
  );
}
