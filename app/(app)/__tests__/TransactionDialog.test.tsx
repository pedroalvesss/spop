import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionDialog } from "../_components/TransactionDialog";
import { buildDefaults } from "../_hooks/useTransactionForm";
import type { TransactionOptions } from "../_components/transactionTypes";

const { postTransaction, putTransaction, deleteTransactionById, toast } = vi.hoisted(() => ({
  postTransaction: vi.fn(),
  putTransaction: vi.fn(),
  deleteTransactionById: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/actions/transacoesActions/postTransaction", () => ({ postTransaction }));
vi.mock("@/actions/transacoesActions/putTransaction", () => ({ putTransaction }));
vi.mock("@/actions/transacoesActions/deleteTransactionById", () => ({ deleteTransactionById }));
vi.mock("@/components/Toast", () => ({ useToast: () => toast }));

const options: TransactionOptions = {
  accounts: [{ id: "nu", name: "Nubank" }],
  cards: [{ id: "c1", name: "Nubank" }],
  categories: [
    { id: "mercado", name: "Mercado", type: "expense" },
    { id: "salario", name: "Salário", type: "income" },
  ],
};

function renderDialog(onOpenChange = vi.fn()) {
  render(<TransactionDialog open editing={null} options={options} onOpenChange={onOpenChange} />);
  return onOpenChange;
}

describe("TransactionDialog", () => {
  beforeEach(() => vi.resetAllMocks());

  it("começa como saída, com a primeira categoria e conta", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: "Saída" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Categoria")).toHaveValue("mercado");
    expect(screen.getByLabelText("Conta")).toHaveValue("nu");
    expect(screen.getByRole("option", { name: "Cartão Nubank" })).toBeInTheDocument();
  });

  it("trocar pra entrada reseta categoria, esconde parcelas e cartões", async () => {
    renderDialog();
    await userEvent.click(screen.getByRole("button", { name: "Entrada" }));
    expect(screen.getByLabelText("Categoria")).toHaveValue("salario");
    expect(screen.queryByLabelText("Parcelas")).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Cartão Nubank" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar entrada" })).toBeInTheDocument();
    expect(screen.getByLabelText("Valor")).toHaveClass("text-income");
  });

  it("valida valor e descrição na ordem do protótipo", async () => {
    renderDialog();
    await userEvent.click(screen.getByRole("button", { name: "Registrar saída" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Coloca um valor. Zero reais não conta, infelizmente.",
    );
    await userEvent.type(screen.getByLabelText("Valor"), "10");
    await userEvent.click(screen.getByRole("button", { name: "Registrar saída" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Descreve o que foi. O Pedro do futuro vai querer saber.",
    );
    expect(postTransaction).not.toHaveBeenCalled();
  });

  it("mostra a dica de parcelas e salva", async () => {
    postTransaction.mockResolvedValue({ ok: true });
    const onOpenChange = renderDialog();
    await userEvent.type(screen.getByLabelText("Valor"), "1.200,00");
    await userEvent.type(screen.getByLabelText("Descrição"), "Notebook");
    await userEvent.selectOptions(screen.getByLabelText("Parcelas"), "3");
    expect(screen.getByText(/3x de R\$\s400,00\. Vai aparecer em Dívidas\./)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Registrar saída" }));
    expect(postTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ amount: "1.200,00", description: "Notebook", installments: "3" }),
    );
    expect(toast).toHaveBeenCalledWith("Anotado. Doeu, mas tá registrado.");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("buildDefaults", () => {
  it("preenche a edição a partir do lançamento", () => {
    const defaults = buildDefaults(
      {
        id: "t1",
        amountCents: -5890,
        description: "iFood",
        categoryId: "mercado",
        accountId: "nu",
        cardId: "c1",
        date: "2026-09-24",
        fromInstallment: false,
      },
      options,
    );
    expect(defaults).toMatchObject({ type: "out", amount: "58,90", source: "card:c1" });
  });
});
