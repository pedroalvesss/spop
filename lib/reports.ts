import { addMonths, monthKey, MONTHS_SHORT } from "@/lib/dates";

export interface MonthFlow {
  month: string;
  incomeCents: number;
  expenseCents: number;
}

export const PERIODS = [3, 6, 12] as const;
export type Period = (typeof PERIODS)[number];

export function parsePeriod(raw: string | string[] | undefined): Period {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return (PERIODS as readonly number[]).includes(n) ? (n as Period) : 6;
}

// Soma entradas e saídas por mês, preenchendo meses vazios com zero.
export function monthlyFlows(
  rows: { date: string; amountCents: number }[],
  currentMonth: string,
  months: number,
): MonthFlow[] {
  const flows = Array.from({ length: months }, (_, i) => ({
    month: addMonths(currentMonth, i - months + 1),
    incomeCents: 0,
    expenseCents: 0,
  }));
  const byMonth = new Map(flows.map((f) => [f.month, f]));
  for (const row of rows) {
    const flow = byMonth.get(monthKey(row.date));
    if (!flow) continue;
    if (row.amountCents > 0) flow.incomeCents += row.amountCents;
    else flow.expenseCents -= row.amountCents;
  }
  return flows;
}

const CHART_PX = 140;

export function chartBars(flows: MonthFlow[]) {
  const max = Math.max(1, ...flows.map((f) => Math.max(f.incomeCents, f.expenseCents)));
  return flows.map((f) => ({
    ...f,
    label: MONTHS_SHORT[Number(f.month.slice(5, 7)) - 1],
    incomePx: Math.round((f.incomeCents / max) * CHART_PX),
    expensePx: Math.round((f.expenseCents / max) * CHART_PX),
  }));
}

export function flowStats(flows: MonthFlow[]) {
  const avgExpenseCents = Math.round(
    flows.reduce((a, f) => a + f.expenseCents, 0) / Math.max(1, flows.length),
  );
  const worst = flows.reduce((a, f) => (f.expenseCents > a.expenseCents ? f : a), flows[0]);
  return {
    avgExpenseCents,
    worstLabel: MONTHS_SHORT[Number(worst.month.slice(5, 7)) - 1],
    worstCents: worst.expenseCents,
  };
}
