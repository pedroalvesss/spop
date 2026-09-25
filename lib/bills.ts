import { diffDays, shortDate } from "@/lib/dates";

export interface BillView {
  id: string;
  name: string;
  icon: string;
  amountCents: number;
  dueDay: number;
  dueDate: string;
  paid: boolean;
  categoryId: string | null;
  accountId: string | null;
}

export interface BillStatus {
  text: string;
  // Atenção quando faltam 2 dias ou menos (inclui atrasada).
  warn: boolean;
}

export function billStatus(bill: Pick<BillView, "paid" | "dueDate">, today: string): BillStatus {
  if (bill.paid) return { text: "Pago", warn: false };
  const days = diffDays(today, bill.dueDate);
  let text: string;
  if (days < 0) text = "Atrasada";
  else if (days === 0) text = "Vence hoje";
  else if (days === 1) text = "Vence amanhã";
  else if (days > 6) text = `Vence ${shortDate(bill.dueDate, true)}`;
  else text = `Vence em ${days} dias`;
  return { text, warn: days <= 2 };
}

// Não pagas primeiro, por dia de vencimento.
export function sortBills<T extends Pick<BillView, "paid" | "dueDay">>(bills: T[]) {
  return [...bills].sort((a, b) => Number(a.paid) - Number(b.paid) || a.dueDay - b.dueDay);
}

export function billTotals(bills: Pick<BillView, "paid" | "amountCents">[]) {
  return bills.reduce(
    (acc, b) => {
      if (b.paid) acc.paidCents += b.amountCents;
      else acc.pendingCents += b.amountCents;
      return acc;
    },
    { pendingCents: 0, paidCents: 0 },
  );
}
