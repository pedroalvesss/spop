import { addMonths, monthShortYear } from "@/lib/dates";

interface DebtLike {
  installmentCents: number;
  totalInstallments: number;
  paidInstallments: number;
}

export function remainingInstallments(debt: DebtLike) {
  return Math.max(0, debt.totalInstallments - debt.paidInstallments);
}

export function remainingCents(debt: DebtLike) {
  return debt.installmentCents * remainingInstallments(debt);
}

// Uma parcela por mês a partir do mês que vem: "acaba dez/2026".
export function debtEndLabel(debt: DebtLike, currentMonth: string) {
  return monthShortYear(addMonths(currentMonth, remainingInstallments(debt)));
}

export function debtsSummary(debts: DebtLike[], currentMonth: string) {
  const totalCents = debts.reduce((a, d) => a + remainingCents(d), 0);
  const longest = Math.max(0, ...debts.map(remainingInstallments));
  return {
    totalCents,
    freeLine:
      totalCents <= 0
        ? "Zero dívidas. Isso é real?"
        : `Se nada mudar, livre de tudo em ${monthShortYear(addMonths(currentMonth, longest))}.`,
  };
}

export function paymentToast(name: string, remainingAfter: number) {
  return remainingAfter <= 0
    ? `${name} quitada! Liberdade!`
    : `Menos uma! Faltam ${remainingAfter}.`;
}
