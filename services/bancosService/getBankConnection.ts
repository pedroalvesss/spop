import "server-only";
import { syncedLabel } from "@/lib/bankImport";
import { db } from "@/lib/db";
import { toISO } from "@/lib/dates";
import { getUserId } from "@/lib/session";

export interface BankConnectionView {
  title: string;
  itemId: string;
  accountId: string;
  cardId: string | null;
  since: string;
  summary: string;
  synced: string;
}

export async function getBankConnection(): Promise<BankConnectionView | null> {
  const connection = await db.bankConnection.findUnique({
    where: { userId: await getUserId() },
    select: {
      bankName: true,
      itemId: true,
      accountId: true,
      cardId: true,
      since: true,
      syncedAt: true,
      account: { select: { name: true } },
      card: { select: { name: true } },
    },
  });
  if (!connection) return null;
  const { account, card, since, syncedAt, bankName, ...rest } = connection;
  return {
    ...rest,
    since: toISO(since),
    title: account.name,
    summary: card ? `via ${bankName} · cartão ${card.name}` : `via ${bankName}`,
    synced: syncedLabel(syncedAt),
  };
}
