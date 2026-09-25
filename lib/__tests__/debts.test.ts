import { describe, expect, it } from "vitest";
import { debtEndLabel, debtsSummary, paymentToast, remainingCents } from "../debts";

const notebook = { installmentCents: 38900, totalInstallments: 10, paidInstallments: 7 };
const emprestimo = { installmentCents: 31840, totalInstallments: 12, paidInstallments: 5 };

describe("dívidas", () => {
  it("calcula o saldo restante e quando acaba", () => {
    expect(remainingCents(notebook)).toBe(116700);
    expect(debtEndLabel(notebook, "2026-09")).toBe("dez/2026");
  });

  it("resume o total e a data de liberdade pela dívida mais longa", () => {
    expect(debtsSummary([notebook, emprestimo], "2026-09")).toEqual({
      totalCents: 116700 + 31840 * 7,
      freeLine: "Se nada mudar, livre de tudo em abr/2027.",
    });
  });

  it("comemora quando não sobra nada", () => {
    expect(debtsSummary([{ ...notebook, paidInstallments: 10 }], "2026-09").freeLine).toBe(
      "Zero dívidas. Isso é real?",
    );
  });

  it("escreve o toast da parcela", () => {
    expect(paymentToast("Notebook", 2)).toBe("Menos uma! Faltam 2.");
    expect(paymentToast("Notebook", 0)).toBe("Notebook quitada! Liberdade!");
  });
});
