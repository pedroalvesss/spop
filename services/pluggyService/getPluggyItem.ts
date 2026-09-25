import "server-only";
import { pluggyGet } from "@/lib/pluggy";

interface PluggyItem {
  id: string;
  connector: { name: string };
}

export async function getPluggyItem(itemId: string) {
  return pluggyGet<PluggyItem>(`/items/${encodeURIComponent(itemId)}`);
}
