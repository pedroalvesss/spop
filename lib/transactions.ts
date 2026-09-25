import { dayLabel } from "@/lib/dates";

interface DatedAmount {
  date: string;
  amountCents: number;
}

export interface DayGroup<T> {
  date: string;
  label: string;
  totalCents: number;
  items: T[];
}

// Agrupa lançamentos (já ordenados por data desc) por dia, com o total de cada dia.
export function groupByDay<T extends DatedAmount>(items: T[], today: string): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const item of items) {
    let group = groups[groups.length - 1];
    if (!group || group.date !== item.date) {
      group = { date: item.date, label: dayLabel(item.date, today), totalCents: 0, items: [] };
      groups.push(group);
    }
    group.items.push(item);
    group.totalCents += item.amountCents;
  }
  return groups;
}

export function countLabel(count: number) {
  return `${count} lançamento${count === 1 ? "" : "s"}`;
}

export const PAGE_SIZE = 50;
const FILTERS = ["all", "in", "out"] as const;
export type TransactionFilter = (typeof FILTERS)[number];

export interface TransactionParams {
  month: string;
  filter: TransactionFilter;
  search: string;
  limit: number;
}

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// Filtros da tela de transações vivem na URL: ?mes=2026-09&tipo=out&q=ifood&limite=100
export function parseTransactionParams(raw: RawParams, currentMonth: string): TransactionParams {
  const month = first(raw.mes);
  const filter = first(raw.tipo) as TransactionFilter;
  const limit = Number(first(raw.limite));
  return {
    month: month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : currentMonth,
    filter: FILTERS.includes(filter) ? filter : "all",
    search: (first(raw.q) ?? "").trim().slice(0, 60),
    limit: Number.isInteger(limit) && limit > 0 ? Math.min(limit, 500) : PAGE_SIZE,
  };
}

export function transactionsHref(params: TransactionParams, changes: Partial<TransactionParams>) {
  const next = { ...params, ...changes };
  const query = new URLSearchParams();
  query.set("mes", next.month);
  if (next.filter !== "all") query.set("tipo", next.filter);
  if (next.search) query.set("q", next.search);
  if (next.limit !== PAGE_SIZE) query.set("limite", String(next.limit));
  return `/transacoes?${query}`;
}
