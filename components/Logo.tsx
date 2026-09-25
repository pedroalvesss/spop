import { cn } from "@/lib/utils";

const SIZES = {
  lg: { symbol: 52, text: "text-[38px]", gap: "gap-3", bold: false },
  md: { symbol: 28, text: "text-[21px]", gap: "gap-2", bold: true },
  sm: { symbol: 26, text: "text-[20px]", gap: "gap-[7px]", bold: true },
} as const;

interface LogoSymbolProps {
  size: number;
  bold?: boolean;
}

// Abaixo de ~32px o traço engrossa pra continuar legível (manual da marca, pág. 04).
export function LogoSymbol({ size, bold = false }: LogoSymbolProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="22" cy="26" r="16" stroke="#9184d9" strokeWidth={bold ? 4 : 3.5} />
      {bold ? (
        <rect x="20" y="16" width="4" height="12" rx="2" fill="#e9e9ed" />
      ) : (
        <rect x="20.25" y="16" width="3.5" height="12" rx="1.75" fill="#e9e9ed" />
      )}
      <circle cx="22" cy="33.5" r={bold ? 2.4 : 2.2} fill="#e9e9ed" />
      <path
        d="M38 10l3-3M41 16h4M33 6V2"
        stroke="#9184d9"
        strokeWidth={bold ? 3 : 2.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

interface LogoProps {
  size?: keyof typeof SIZES;
  className?: string;
}

export function Logo({ size = "lg", className }: LogoProps) {
  const s = SIZES[size];
  return (
    <div className={cn("flex items-center", s.gap, className)}>
      <LogoSymbol size={s.symbol} bold={s.bold} />
      <span className={cn("leading-none font-semibold tracking-[-0.04em]", s.text)}>
        spop<span className="text-accent">!</span>
      </span>
    </div>
  );
}
