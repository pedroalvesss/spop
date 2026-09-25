import "server-only";
import type { PluggyAccountType } from "@/lib/bankImport";
import { pluggyGet } from "@/lib/pluggy";

interface PluggyAccount {
  id: string;
  type: PluggyAccountType;
}

export async function getPluggyAccounts(itemId: string) {
  const page = await pluggyGet<{ results: PluggyAccount[] }>(
    `/accounts?itemId=${encodeURIComponent(itemId)}`,
  );
  return page?.results ?? [];
}
