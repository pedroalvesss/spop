import "server-only";
import { db } from "@/lib/db";
import { monthRange } from "@/lib/dates";
import { getUserId } from "@/lib/session";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { TransactionParams } from "@/lib/transactions";
import { toTransactionDto, transactionSelect, type TransactionDto } from "./transactionDto";

export interface TransactionsPage {
  items: TransactionDto[];
  count: number;
  netCents: number;
  hasMore: boolean;
}

export async function getTransactionsPaginated(
  query: TransactionParams,
): Promise<TransactionsPage> {
  const { start, end } = monthRange(query.month);
  const where: Prisma.TransactionWhereInput = {
    userId: await getUserId(),
    date: { gte: start, lt: end },
  };
  if (query.filter !== "all") where.amountCents = query.filter === "in" ? { gt: 0 } : { lt: 0 };
  if (query.search) {
    // A busca procura na descrição e no nome da categoria.
    where.OR = [
      { description: { contains: query.search, mode: "insensitive" } },
      { category: { name: { contains: query.search, mode: "insensitive" } } },
    ];
  }

  const [rows, totals] = await Promise.all([
    db.transaction.findMany({
      where,
      select: transactionSelect,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: query.limit + 1,
    }),
    db.transaction.aggregate({ where, _sum: { amountCents: true }, _count: true }),
  ]);

  return {
    items: rows.slice(0, query.limit).map(toTransactionDto),
    count: totals._count,
    netCents: totals._sum.amountCents ?? 0,
    hasMore: rows.length > query.limit,
  };
}
