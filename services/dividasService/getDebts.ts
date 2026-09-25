import "server-only";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

export interface DebtDto {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  installmentCents: number;
  totalInstallments: number;
  paidInstallments: number;
  accountId: string | null;
}

export async function getDebts(): Promise<DebtDto[]> {
  return db.debt.findMany({
    where: { userId: await getUserId() },
    select: {
      id: true,
      name: true,
      subtitle: true,
      icon: true,
      installmentCents: true,
      totalInstallments: true,
      paidInstallments: true,
      accountId: true,
    },
    orderBy: { createdAt: "asc" },
  });
}
