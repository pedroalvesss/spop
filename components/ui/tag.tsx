import { cn } from "@/lib/utils";

const TONES = {
  accent: "bg-accent-800 text-accent-100",
  neutral: "bg-neutral-800 text-neutral-100",
  expense: "bg-expense/22 text-expense",
  warn: "bg-warn/20 text-warn",
} as const;

interface TagProps {
  tone: keyof typeof TONES;
  children: React.ReactNode;
}

export function Tag({ tone, children }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-[3px] text-[11px] tracking-[0.02em]",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}
