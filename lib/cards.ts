import { addMonths, dateInMonth, monthKey } from "@/lib/dates";

export interface BillingCycle {
  // Compras depois de `start` e até `closingDate` (inclusive) entram na fatura atual.
  start: string;
  closingDate: string;
  dueDate: string;
}

export function billingCycle(today: string, closingDay: number, dueDay: number): BillingCycle {
  const month = monthKey(today);
  const closingThisMonth = dateInMonth(month, closingDay);
  const closingMonth = today <= closingThisMonth ? month : addMonths(month, 1);
  const closingDate = dateInMonth(closingMonth, closingDay);
  const start = dateInMonth(addMonths(closingMonth, -1), closingDay);
  // Vencimento depois do fechamento: mesmo mês se o dia for maior, senão no mês seguinte.
  const dueMonth = dueDay > closingDay ? closingMonth : addMonths(closingMonth, 1);
  return { start, closingDate, dueDate: dateInMonth(dueMonth, dueDay) };
}

interface CardDebt {
  installmentCents: number;
  totalInstallments: number;
  paidInstallments: number;
}

// Limite usado = fatura atual + parcelas que ainda vão cair no cartão.
export function usedLimitCents(invoiceCents: number, debts: CardDebt[]) {
  const future = debts.reduce(
    (a, d) => a + d.installmentCents * Math.max(0, d.totalInstallments - d.paidInstallments),
    0,
  );
  return invoiceCents + future;
}
