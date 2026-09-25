import { cn } from "@/lib/utils";
import { getPasswordScore, PASSWORD_LABELS } from "@/lib/passwordStrength";

const BARS = [1, 2, 3, 4] as const;

function barColor(bar: number, score: number) {
  if (bar > score) return "bg-neutral-800";
  if (score <= 1) return "bg-expense";
  return score === 2 ? "bg-warn" : "bg-accent";
}

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const score = getPasswordScore(password);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {BARS.map((bar) => (
          <div
            key={bar}
            data-testid="password-bar"
            className={cn("h-1 flex-1 rounded-[2px]", barColor(bar, score))}
          />
        ))}
      </div>
      <div className="text-xs text-neutral-500">{PASSWORD_LABELS[score]}</div>
    </div>
  );
}
