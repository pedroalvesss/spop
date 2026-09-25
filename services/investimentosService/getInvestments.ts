import "server-only";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

export interface InvestmentDto {
  id: string;
  name: string;
  subtitle: string;
  amountCents: number;
  baseCents: number;
  baseMonth: string;
}

export async function getInvestments(): Promise<InvestmentDto[]> {
  return db.investment.findMany({
    where: { userId: await getUserId() },
    select: {
      id: true,
      name: true,
      subtitle: true,
      amountCents: true,
      baseCents: true,
      baseMonth: true,
    },
    orderBy: { createdAt: "asc" },
  });
}
