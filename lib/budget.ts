interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  type: "expense" | "income";
  monthlyBudgetCents: number | null;
}

export interface BudgetRow {
  id: string;
  name: string;
  icon: string;
  budgetCents: number;
  spentCents: number;
  ratio: number;
}

// Categorias de saída com orçamento, da mais apertada pra mais folgada.
export function buildBudgetRows(
  categories: BudgetCategory[],
  spentByCategory: Record<string, number>,
): BudgetRow[] {
  return categories
    .filter((c) => c.type === "expense" && (c.monthlyBudgetCents ?? 0) > 0)
    .map((c) => {
      const budgetCents = c.monthlyBudgetCents!;
      const spentCents = spentByCategory[c.id] ?? 0;
      return {
        id: c.id,
        name: c.name,
        icon: c.icon,
        budgetCents,
        spentCents,
        ratio: spentCents / budgetCents,
      };
    })
    .sort((a, b) => b.ratio - a.ratio);
}

export type BudgetStatus = "over" | "near" | "ok";

export function budgetStatus(ratio: number): BudgetStatus {
  if (ratio > 1) return "over";
  return ratio >= 0.85 ? "near" : "ok";
}

export type BudgetInsight =
  | { kind: "over"; name: string; overCents: number }
  | { kind: "near"; name: string; pct: number }
  | { kind: "ok" };

// O insight do Início olha a categoria com maior % do orçamento.
export function budgetInsight(rows: BudgetRow[]): BudgetInsight {
  const worst = rows[0];
  if (!worst) return { kind: "ok" };
  const status = budgetStatus(worst.ratio);
  if (status === "over") {
    return { kind: "over", name: worst.name, overCents: worst.spentCents - worst.budgetCents };
  }
  if (status === "near")
    return { kind: "near", name: worst.name, pct: Math.round(worst.ratio * 100) };
  return { kind: "ok" };
}
