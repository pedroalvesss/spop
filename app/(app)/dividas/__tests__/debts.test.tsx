import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DebtDto } from "@/services/dividasService/getDebts";
import { DebtsList } from "../_components/DebtsList";

const { postDebtPayment, postDebt, deleteDebtById, toast } = vi.hoisted(() => ({
  postDebtPayment: vi.fn(),
  postDebt: vi.fn(),
  deleteDebtById: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/actions/dividasActions/postDebtPayment", () => ({ postDebtPayment }));
vi.mock("@/actions/dividasActions/postDebt", () => ({ postDebt }));
vi.mock("@/actions/dividasActions/deleteDebtById", () => ({ deleteDebtById }));
vi.mock("@/components/Toast", () => ({ useToast: () => toast }));

function debt(overrides: Partial<DebtDto>): DebtDto {
  return {
    id: "d1",
    name: "Empréstimo da mãe",
    subtitle: "Sem juros, com culpa",
    icon: "heart",
    installmentCents: 10000,
    totalInstallments: 6,
    paidInstallments: 2,
    accountId: null,
    ...overrides,
  };
}

const accounts = [{ id: "nu", name: "Nubank" }];

beforeEach(() => vi.resetAllMocks());

describe("DebtsList", () => {
  it("desenha uma pílula por parcela e mostra quando acaba", () => {
    render(<DebtsList debts={[debt({})]} currentMonth="2026-09" accounts={accounts} />);
    const pills = screen.getAllByTestId("installment");
    expect(pills).toHaveLength(6);
    expect(pills.filter((p) => p.classList.contains("bg-accent"))).toHaveLength(2);
    expect(screen.getByText(/2 de 6 ·/).textContent?.replace(/ /g, " ")).toBe(
      "2 de 6 · R$ 100,00/mês · acaba jan/2027",
    );
  });

  it("pagar parcela avança na hora e avisa quantas faltam", async () => {
    render(<DebtsList debts={[debt({})]} currentMonth="2026-09" accounts={accounts} />);
    await userEvent.click(screen.getByRole("button", { name: "Pagar parcela" }));
    expect(postDebtPayment).toHaveBeenCalledWith("d1");
    expect(toast).toHaveBeenCalledWith("Menos uma! Faltam 3.");
  });

  it("na última parcela comemora e mostra Quitada", async () => {
    const { rerender } = render(
      <DebtsList
        debts={[debt({ paidInstallments: 5 })]}
        currentMonth="2026-09"
        accounts={accounts}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Pagar parcela" }));
    expect(toast).toHaveBeenCalledWith("Empréstimo da mãe quitada! Liberdade!");
    rerender(
      <DebtsList
        debts={[debt({ paidInstallments: 6 })]}
        currentMonth="2026-09"
        accounts={accounts}
      />,
    );
    expect(screen.getByText("Quitada")).toBeInTheDocument();
    expect(screen.getByText("6 de 6 pagas")).toBeInTheDocument();
  });

  it("cadastra dívida nova pelo card tracejado", async () => {
    postDebt.mockResolvedValue({ ok: true });
    render(<DebtsList debts={[]} currentMonth="2026-09" accounts={accounts} />);
    await userEvent.click(screen.getByRole("button", { name: "Nova dívida" }));
    await userEvent.type(await screen.findByLabelText("Nome"), "Celular");
    await userEvent.type(screen.getByLabelText("Parcela"), "150");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar dívida" }));
    expect(postDebt).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Celular", installment: "150", accountId: "" }),
      undefined,
    );
  });
});
