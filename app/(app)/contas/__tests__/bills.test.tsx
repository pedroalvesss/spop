import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BillView } from "@/lib/bills";
import { BillsList } from "../_components/BillsList";
import { NextBillsCard } from "../../(inicio)/_components/NextBillsCard";

const { postBillPayment, postBill, deleteBillById, toast } = vi.hoisted(() => ({
  postBillPayment: vi.fn(),
  postBill: vi.fn(),
  deleteBillById: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/actions/contasPagarActions/postBillPayment", () => ({ postBillPayment }));
vi.mock("@/actions/contasPagarActions/postBill", () => ({ postBill }));
vi.mock("@/actions/contasPagarActions/deleteBillById", () => ({ deleteBillById }));
vi.mock("@/components/Toast", () => ({ useToast: () => toast }));

function bill(overrides: Partial<BillView>): BillView {
  return {
    id: "internet",
    name: "Internet",
    icon: "wifi-high",
    amountCents: 9990,
    dueDay: 26,
    dueDate: "2026-09-26",
    paid: false,
    categoryId: "moradia",
    accountId: "nu",
    ...overrides,
  };
}

const bills = [
  bill({}),
  bill({ id: "academia", name: "Academia", dueDay: 30, dueDate: "2026-09-30" }),
  bill({ id: "aluguel", name: "Aluguel", dueDay: 5, dueDate: "2026-09-05", paid: true }),
];
const options = {
  categories: [{ id: "moradia", name: "Moradia", type: "expense" as const }],
  accounts: [{ id: "nu", name: "Nubank" }],
};

beforeEach(() => vi.resetAllMocks());

describe("BillsList", () => {
  it("mostra status com atenção nos 2 últimos dias e pagas apagadas", () => {
    render(<BillsList bills={bills} today="2026-09-24" options={options} />);
    expect(screen.getByText("Vence em 2 dias")).toHaveClass("text-warn");
    expect(screen.getByText("Vence em 6 dias")).toHaveClass("text-neutral-500");
    expect(screen.getByText("Aluguel")).toHaveClass("opacity-50");
  });

  it("marca como paga na hora e comemora", async () => {
    postBillPayment.mockResolvedValue(undefined);
    render(<BillsList bills={bills} today="2026-09-24" options={options} />);
    const check = screen.getByRole("button", { name: "Marcar Internet como paga" });
    await userEvent.click(check);
    expect(postBillPayment).toHaveBeenCalledWith("internet");
    expect(toast).toHaveBeenCalledWith("Internet: paga. Menos um boleto na vida.");
  });

  it("cria uma conta nova pelo formulário", async () => {
    postBill.mockResolvedValue({ ok: true });
    render(<BillsList bills={[]} today="2026-09-24" options={options} />);
    await userEvent.click(screen.getByRole("button", { name: "Adicionar conta" }));
    await userEvent.type(await screen.findByLabelText("Nome"), "Água");
    await userEvent.type(screen.getByLabelText("Valor"), "80");
    await userEvent.click(screen.getByRole("radio", { name: "drop" }));
    await userEvent.click(screen.getByRole("button", { name: "Adicionar conta" }));
    expect(postBill).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Água", amount: "80", icon: "drop", categoryId: "moradia" }),
      undefined,
    );
  });

  it("edita tocando na conta", async () => {
    render(<BillsList bills={bills} today="2026-09-24" options={options} />);
    await userEvent.click(screen.getByRole("button", { name: /^Academia/ }));
    expect(await screen.findByLabelText("Nome")).toHaveValue("Academia");
    expect(screen.getByLabelText("Valor")).toHaveValue("99,90");
  });
});

describe("NextBillsCard", () => {
  it("lista só as 3 próximas não pagas", () => {
    render(
      <NextBillsCard
        today="2026-09-24"
        bills={[...bills, bill({ id: "a" }), bill({ id: "b", name: "Quarta" })]}
      />,
    );
    expect(screen.queryByText("Aluguel")).not.toBeInTheDocument();
    expect(screen.queryByText("Quarta")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "/contas");
  });
});
