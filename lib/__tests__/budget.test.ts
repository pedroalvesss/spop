import { describe, expect, it } from "vitest";
import { budgetInsight, budgetStatus, buildBudgetRows } from "../budget";

const categories = [
  {
    id: "mercado",
    name: "Mercado",
    icon: "shopping-cart",
    type: "expense" as const,
    monthlyBudgetCents: 60000,
  },
  {
    id: "lazer",
    name: "Lazer",
    icon: "game-controller",
    type: "expense" as const,
    monthlyBudgetCents: 20000,
  },
  {
    id: "sem",
    name: "Sem orçamento",
    icon: "star",
    type: "expense" as const,
    monthlyBudgetCents: null,
  },
  {
    id: "salario",
    name: "Salário",
    icon: "briefcase",
    type: "income" as const,
    monthlyBudgetCents: null,
  },
];

describe("buildBudgetRows", () => {
  it("ignora entradas e categorias sem orçamento e ordena pelo maior %", () => {
    const rows = buildBudgetRows(categories, { mercado: 51817, lazer: 22399 });
    expect(rows.map((r) => r.id)).toEqual(["lazer", "mercado"]);
    expect(rows[0].ratio).toBeCloseTo(1.12, 2);
  });
});

describe("budgetInsight", () => {
  it("avisa quando estourou, com quanto passou", () => {
    const rows = buildBudgetRows(categories, { lazer: 22399 });
    expect(budgetInsight(rows)).toEqual({ kind: "over", name: "Lazer", overCents: 2399 });
  });

  it("avisa quando está quase lá", () => {
    const rows = buildBudgetRows(categories, { mercado: 51817 });
    expect(budgetInsight(rows)).toEqual({ kind: "near", name: "Mercado", pct: 86 });
  });

  it("parabeniza quando está tudo dentro", () => {
    expect(budgetInsight(buildBudgetRows(categories, {}))).toEqual({ kind: "ok" });
    expect(budgetInsight([])).toEqual({ kind: "ok" });
  });

  it("classifica o status", () => {
    expect(budgetStatus(0.84)).toBe("ok");
    expect(budgetStatus(0.85)).toBe("near");
    expect(budgetStatus(1)).toBe("near");
    expect(budgetStatus(1.001)).toBe("over");
  });
});
