import { formatSigned } from "@/lib/money";

// Cores da alocação, em ordem: accent, accent-300, neutral-500, neutral-700, accent-700.
export const ALLOCATION_COLORS = [
  "bg-accent",
  "bg-accent-300",
  "bg-neutral-500",
  "bg-neutral-700",
  "bg-accent-700",
];

export function allocationColor(index: number) {
  return ALLOCATION_COLORS[index % ALLOCATION_COLORS.length];
}

interface InvestmentLike {
  amountCents: number;
  baseCents: number;
  baseMonth: string;
}

// Rendimento do mês = valor atual − valor no início do mês (só de quem foi atualizado no mês).
export function monthYield(investments: InvestmentLike[], month: string) {
  return investments
    .filter((i) => i.baseMonth === month)
    .reduce((a, i) => a + i.amountCents - i.baseCents, 0);
}

// Ao atualizar o valor num mês novo, o valor anterior vira a base desse mês.
export function rebase(current: InvestmentLike, newAmountCents: number, month: string) {
  const baseCents = current.baseMonth === month ? current.baseCents : current.amountCents;
  return { amountCents: newAmountCents, baseCents, baseMonth: month };
}

const PASTEL_CENTS = 1500;

export function yieldLine(yieldCents: number) {
  const pasteis = Math.floor(yieldCents / PASTEL_CENTS);
  let joke = "ainda não paga um pastel";
  if (pasteis === 1) joke = "paga um pastel";
  if (pasteis > 1) joke = `paga uns ${pasteis} pastéis`;
  return `${formatSigned(yieldCents).replace(" ", "")} este mês · ${joke}`;
}
