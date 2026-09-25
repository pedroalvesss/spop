import { describe, expect, it } from "vitest";
import { billStatus, billTotals, sortBills } from "../bills";

const today = "2026-09-24";

describe("billStatus", () => {
  it.each([
    [{ paid: true, dueDate: "2026-09-05" }, "Pago", false],
    [{ paid: false, dueDate: "2026-09-20" }, "Atrasada", true],
    [{ paid: false, dueDate: "2026-09-24" }, "Vence hoje", true],
    [{ paid: false, dueDate: "2026-09-25" }, "Vence amanhã", true],
    [{ paid: false, dueDate: "2026-09-26" }, "Vence em 2 dias", true],
    [{ paid: false, dueDate: "2026-09-27" }, "Vence em 3 dias", false],
    [{ paid: false, dueDate: "2026-09-30" }, "Vence em 6 dias", false],
    [{ paid: false, dueDate: "2026-10-02" }, "Vence 02 out", false],
  ])("%j → %s", (bill, text, warn) => {
    expect(billStatus(bill, today)).toEqual({ text, warn });
  });
});

describe("sortBills e billTotals", () => {
  const bills = [
    { id: "aluguel", paid: true, dueDay: 5, amountCents: 140000 },
    { id: "academia", paid: false, dueDay: 30, amountCents: 8990 },
    { id: "internet", paid: false, dueDay: 26, amountCents: 9990 },
  ];

  it("põe as não pagas primeiro, por vencimento", () => {
    expect(sortBills(bills).map((b) => b.id)).toEqual(["internet", "academia", "aluguel"]);
  });

  it("soma o que falta e o que já foi", () => {
    expect(billTotals(bills)).toEqual({ pendingCents: 18980, paidCents: 140000 });
  });
});
