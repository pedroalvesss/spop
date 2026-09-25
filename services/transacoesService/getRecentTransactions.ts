import "server-only";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";
import { toTransactionDto, transactionSelect, type TransactionDto } from "./transactionDto";

export async function getRecentTransactions(limit = 5): Promise<TransactionDto[]> {
  const rows = await db.transaction.findMany({
    where: { userId: await getUserId() },
    select: transactionSelect,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map(toTransactionDto);
}
