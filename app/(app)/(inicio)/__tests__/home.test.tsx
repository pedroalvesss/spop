import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HideValuesProvider } from "@/components/HideValues";
import { BalanceCard } from "../_components/BalanceCard";
import { InsightCard } from "../_components/InsightCard";
import { RecentTransactionsCard } from "../_components/RecentTransactionsCard";

vi.mock("../../_contexts/TransactionDialogContext", () => ({
  useTransactionDialog: () => ({ openEdit: vi.fn(), openNew: vi.fn() }),
}));

const accounts = [
  { id: "nu", name: "Nubank", color: "#9184d9", balanceCents: 128437 },
  { id: "din", name: "Dinheiro", color: "#9397ab", balanceCents: 6200 },
];

const text = (el: HTMLElement) => el.textContent?.replace(/ /g, " ");

describe("BalanceCard", () => {
  it("soma as contas e mostra os centavos à parte", () => {
    render(
      <BalanceCard
        accounts={accounts}
        incomeCents={469500}
        expenseCents={257226}
        monthName="setembro"
        salaryText="Faltam 6 dias pro salário"
      />,
    );
    expect(text(screen.getByText(",37").parentElement!)).toBe("R$ 1.346,37");
    expect(screen.getByText("Entrou em setembro")).toBeInTheDocument();
    expect(text(screen.getByText(/Sobraram/))).toBe(
      "Sobraram R$ 2.122,74 do que entrou. Por enquanto.",
    );
  });

  it("avisa quando saiu mais do que entrou", () => {
    render(
      <BalanceCard
        accounts={accounts}
        incomeCents={1000}
        expenseCents={5000}
        monthName="set"
        salaryText=""
      />,
    );
    expect(text(screen.getByText(/Eita/))).toBe("Saiu R$ 40,00 a mais do que entrou. Eita.");
  });

  it("com valores ocultos troca a frase", () => {
    render(
      <HideValuesProvider initialHidden>
        <BalanceCard
          accounts={accounts}
          incomeCents={1}
          expenseCents={0}
          monthName="set"
          salaryText=""
        />
      </HideValuesProvider>,
    );
    expect(screen.getByText("Valores ocultos")).toBeInTheDocument();
    expect(screen.queryByText(/1\.346/)).not.toBeInTheDocument();
  });
});

describe("InsightCard", () => {
  it.each([
    [
      { kind: "over", name: "Lazer", overCents: 2399 } as const,
      /Lazer estourou em R\$\s23,99/,
      "A gente finge",
    ],
    [{ kind: "near", name: "Mercado", pct: 86 } as const, /Mercado já foi 86%/, "Segura a onda"],
    [{ kind: "ok" } as const, /Tudo dentro do orçamento/, "Quem é você"],
  ])("escreve o insight %#", (insight, title, body) => {
    render(<InsightCard insight={insight} />);
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(body))).toBeInTheDocument();
  });
});

describe("RecentTransactionsCard", () => {
  it("mostra data e categoria na meta", () => {
    render(
      <RecentTransactionsCard
        transactions={[
          {
            id: "t1",
            description: "Uber pro trabalho",
            amountCents: -1740,
            date: "2026-09-24",
            categoryId: "c",
            categoryName: "Transporte",
            categoryIcon: "bus",
            accountId: "a",
            accountName: "Nubank",
            cardId: null,
            fromInstallment: false,
          },
        ]}
      />,
    );
    expect(screen.getByText("24 set · Transporte")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver todos" })).toHaveAttribute("href", "/transacoes");
  });
});
