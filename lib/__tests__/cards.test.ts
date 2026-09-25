import { describe, expect, it } from "vitest";
import { billingCycle, usedLimitCents } from "../cards";

describe("billingCycle", () => {
  it("depois do fechamento, a fatura atual fecha no mês que vem", () => {
    expect(billingCycle("2026-09-24", 3, 10)).toEqual({
      start: "2026-09-03",
      closingDate: "2026-10-03",
      dueDate: "2026-10-10",
    });
  });

  it("antes do fechamento, fecha neste mês", () => {
    expect(billingCycle("2026-09-02", 3, 10)).toMatchObject({
      start: "2026-08-03",
      closingDate: "2026-09-03",
    });
  });

  it("vencimento antes do dia de fechamento cai no mês seguinte", () => {
    expect(billingCycle("2026-09-10", 25, 5)).toEqual({
      start: "2026-08-25",
      closingDate: "2026-09-25",
      dueDate: "2026-10-05",
    });
  });

  it("dia 31 em fevereiro vira o último dia", () => {
    expect(billingCycle("2027-02-10", 31, 8).closingDate).toBe("2027-02-28");
  });
});

describe("usedLimitCents", () => {
  it("soma a fatura com as parcelas futuras", () => {
    const debts = [{ installmentCents: 38900, totalInstallments: 10, paidInstallments: 7 }];
    expect(usedLimitCents(100000, debts)).toBe(100000 + 38900 * 3);
  });
});
