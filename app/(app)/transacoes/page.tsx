import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { Money } from "@/components/HideValues";
import { MonthStepper } from "@/components/MonthStepper";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { monthKey, todayISO } from "@/lib/dates";
import {
  countLabel,
  groupByDay,
  PAGE_SIZE,
  parseTransactionParams,
  transactionsHref,
  type TransactionFilter,
} from "@/lib/transactions";
import { getTransactionsPaginated } from "@/services/transacoesService/getTransactionsPaginated";
import { requireModule } from "@/services/usuariosService/getCurrentUser";
import { SearchField } from "./_components/SearchField";
import { TransactionGroups } from "./_components/TransactionGroups";

export const metadata: Metadata = { title: "Transações · SPOP!" };

const FILTER_LABELS: [TransactionFilter, string][] = [
  ["all", "Tudo"],
  ["in", "Entradas"],
  ["out", "Saídas"],
];

export default async function TransactionsPage({ searchParams }: PageProps<"/transacoes">) {
  await requireModule("tx");
  const today = todayISO();
  const params = parseTransactionParams(await searchParams, monthKey(today));
  const page = await getTransactionsPaginated(params);
  const groups = groupByDay(page.items, today);

  function hrefForMonth(month: string) {
    return transactionsHref(params, { month, limit: PAGE_SIZE });
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchField defaultValue={params.search} />
        <Segmented
          label="Filtrar por tipo"
          value={params.filter}
          className="flex-[1_1_240px]"
          options={FILTER_LABELS.map(([value, label]) => ({
            value,
            label,
            href: transactionsHref(params, { filter: value, limit: PAGE_SIZE }),
          }))}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-x-[18px] text-[13px] text-neutral-400">
          <span>{countLabel(page.count)}</span>
          <span>
            Resultado:{" "}
            <span className="text-text tabular-nums">
              <Money cents={page.netCents} signed hiddenText="••••" />
            </span>
          </span>
        </div>
        <MonthStepper month={params.month} currentMonth={monthKey(today)} hrefFor={hrefForMonth} />
      </div>
      {groups.length === 0 ? (
        <EmptyState>Nada por aqui. Ou você não gastou, ou está escondendo algo.</EmptyState>
      ) : (
        <TransactionGroups groups={groups} />
      )}
      {page.hasMore && (
        <Button variant="secondary" asChild className="min-h-11 rounded-xl">
          <Link href={transactionsHref(params, { limit: params.limit + PAGE_SIZE })} scroll={false}>
            Carregar mais
          </Link>
        </Button>
      )}
    </div>
  );
}
