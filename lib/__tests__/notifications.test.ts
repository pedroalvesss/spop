import { describe, expect, it, vi } from "vitest";
import { billPush, budgetAlert, dueBills } from "../notifications";

vi.mock("@/lib/push", () => ({}));

const nbsp = (s: string) => s.replace(/ /g, " ");

describe("budgetAlert", () => {
  it("avisa quando cruza 85%", () => {
    expect(budgetAlert("Mercado", 60000, 45000, 51817)).toMatchObject({
      title: "Mercado já foi 86%",
      body: "Segura a onda até o dia 30.",
    });
  });

  it("avisa quando estoura", () => {
    const alert = budgetAlert("Lazer", 20000, 17400, 22399)!;
    expect(nbsp(alert.title)).toBe("Lazer estourou em R$ 23,99");
  });

  it("fica quieto se já tinha passado da linha ou não chegou nela", () => {
    expect(budgetAlert("Lazer", 20000, 21000, 23000)).toBeNull();
    expect(budgetAlert("Lazer", 20000, 1000, 2000)).toBeNull();
    expect(budgetAlert("Lazer", 20000, 17500, 18000)).toBeNull();
  });
});

describe("lembrete de contas", () => {
  const bills = [
    { name: "Internet", amountCents: 9990, paid: false, dueDate: "2026-09-25" },
    { name: "Luz", amountCents: 12840, paid: false, dueDate: "2026-09-24" },
    { name: "Aluguel", amountCents: 140000, paid: true, dueDate: "2026-09-24" },
    { name: "Academia", amountCents: 8990, paid: false, dueDate: "2026-09-30" },
  ];

  it("pega só as não pagas que vencem hoje ou amanhã", () => {
    expect(dueBills(bills, "2026-09-24").map((b) => b.name)).toEqual(["Internet", "Luz"]);
  });

  it("monta o push", () => {
    const push = billPush(bills[0], "2026-09-24");
    expect(push.title).toBe("Internet: vence amanhã");
    expect(nbsp(push.body)).toBe("R$ 99,90. Toca pra marcar como paga.");
  });
});
