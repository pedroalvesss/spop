import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HideValuesProvider } from "@/components/HideValues";
import { MonthStepper } from "@/components/MonthStepper";
import { groupByDay } from "@/lib/transactions";
import type { TransactionDto } from "@/services/transacoesService/transactionDto";
import { SearchField } from "../_components/SearchField";
import { TransactionGroups } from "../_components/TransactionGroups";

const router = { replace: vi.fn() };
const openEdit = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/transacoes",
  useSearchParams: () => new URLSearchParams("mes=2026-09&limite=100"),
}));
vi.mock("../../_contexts/TransactionDialogContext", () => ({
  useTransactionDialog: () => ({ openEdit, openNew: vi.fn() }),
}));

function tx(overrides: Partial<TransactionDto>): TransactionDto {
  return {
    id: "t1",
    description: "iFood: pizza de sexta antecipada",
    amountCents: -5890,
    date: "2026-09-24",
    categoryId: "c",
    categoryName: "Comer fora",
    categoryIcon: "hamburger",
    accountId: "a",
    accountName: "Nubank",
    cardId: null,
    fromInstallment: false,
    ...overrides,
  };
}

beforeEach(() => vi.clearAllMocks());

describe("TransactionGroups", () => {
  const groups = groupByDay(
    [tx({}), tx({ id: "t2", description: "Pix do João", amountCents: 4500, date: "2026-09-23" })],
    "2026-09-24",
  );

  it("mostra o dia, o total e a meta categoria · conta", () => {
    render(<TransactionGroups groups={groups} />);
    expect(screen.getByText("Hoje")).toBeInTheDocument();
    expect(screen.getByText("Ontem")).toBeInTheDocument();
    expect(screen.getAllByText("Comer fora · Nubank")).toHaveLength(2);
    expect(screen.getByText(/^\+ R\$\s45,00$/, { selector: "div" })).toHaveClass("text-income");
  });

  it("esconde o total do dia com os valores ocultos", () => {
    render(
      <HideValuesProvider initialHidden>
        <TransactionGroups groups={groups} />
      </HideValuesProvider>,
    );
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
    expect(screen.getAllByText("••••")).toHaveLength(2);
  });

  it("abre o lançamento pra editar", async () => {
    render(<TransactionGroups groups={groups} />);
    await userEvent.click(screen.getByRole("button", { name: /Pix do João/ }));
    expect(openEdit).toHaveBeenCalledWith(expect.objectContaining({ id: "t2", amountCents: 4500 }));
  });
});

describe("SearchField", () => {
  it("atualiza a URL depois de uma pausa e volta pra primeira página", () => {
    vi.useFakeTimers();
    render(<SearchField defaultValue="" />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "ifood" } });
    expect(router.replace).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(router.replace).toHaveBeenCalledWith("/transacoes?mes=2026-09&q=ifood", {
      scroll: false,
    });
    vi.useRealTimers();
  });
});

describe("MonthStepper", () => {
  function hrefFor(month: string) {
    return `/transacoes?mes=${month}`;
  }

  it("não deixa passar do mês atual", () => {
    render(<MonthStepper month="2026-09" currentMonth="2026-09" hrefFor={hrefFor} />);
    expect(screen.getByText("set 2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mês anterior" })).toHaveAttribute(
      "href",
      "/transacoes?mes=2026-08",
    );
    expect(screen.queryByRole("link", { name: "Próximo mês" })).not.toBeInTheDocument();
  });
});
