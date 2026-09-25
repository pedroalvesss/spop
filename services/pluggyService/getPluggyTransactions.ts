import "server-only";
import type { PluggyTransaction } from "@/lib/bankImport";
import { pluggyGet } from "@/lib/pluggy";

interface TransactionsPage {
  results: PluggyTransaction[];
  // Query string pronta da próxima página ("?accountId=...&after=..."), ou null no fim.
  next: string | null;
}

export async function getPluggyTransactions(accountId: string, from: string) {
  const all: PluggyTransaction[] = [];
  let query: string | null = `?accountId=${encodeURIComponent(accountId)}&dateFrom=${from}`;
  while (query) {
    const page: TransactionsPage | null = await pluggyGet<TransactionsPage>(
      `/v2/transactions${query}`,
    );
    all.push(...(page?.results ?? []));
    query = page?.next ?? null;
  }
  return all;
}
