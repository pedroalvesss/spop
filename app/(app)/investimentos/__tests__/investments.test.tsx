import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InvestmentDto } from "@/services/investimentosService/getInvestments";
import { InvestmentSummary } from "../_components/InvestmentSummary";
import { InvestmentsList } from "../_components/InvestmentsList";

const { postInvestment, deleteInvestmentById, toast } = vi.hoisted(() => ({
  postInvestment: vi.fn(),
  deleteInvestmentById: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/actions/investimentosActions/postInvestment", () => ({ postInvestment }));
vi.mock("@/actions/investimentosActions/deleteInvestmentById", () => ({ deleteInvestmentById }));
vi.mock("@/components/Toast", () => ({ useToast: () => toast }));

const investments: InvestmentDto[] = [
  {
    id: "a",
    name: "Caixinha Nubank",
    subtitle: "100% do CDI",
    amountCents: 320000,
    baseCents: 315180,
    baseMonth: "2026-09",
  },
  {
    id: "b",
    name: "Tesouro Selic 2029",
    subtitle: "Tesouro Direto",
    amountCents: 185000,
    baseCents: 185000,
    baseMonth: "2026-09",
  },
  {
    id: "c",
    name: "FIIs",
    subtitle: "3 fundos",
    amountCents: 64000,
    baseCents: 64000,
    baseMonth: "2026-09",
  },
];

beforeEach(() => vi.resetAllMocks());

describe("InvestmentSummary", () => {
  it("mostra rendimento em verde e a barra de alocação proporcional", () => {
    render(<InvestmentSummary totalCents={569000} yieldCents={4820} amounts={investments} />);
    expect(screen.getByText(/paga uns 3 pastéis/)).toHaveClass("text-income");
    const bars = screen.getAllByTestId("allocation");
    expect(bars[0]).toHaveClass("bg-accent");
    expect(bars[1]).toHaveClass("bg-accent-300");
    expect(bars[0].style.width).toMatch(/^56\.2/);
  });
});

describe("InvestmentsList", () => {
  it("mostra % de cada ativo", () => {
    render(<InvestmentsList investments={investments} totalCents={569000} />);
    expect(screen.getByText("56%")).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
    expect(screen.getByText("11%")).toBeInTheDocument();
  });

  it("atualiza o valor tocando no ativo", async () => {
    postInvestment.mockResolvedValue({ ok: true });
    render(<InvestmentsList investments={investments} totalCents={569000} />);
    await userEvent.click(screen.getByRole("button", { name: /Tesouro Selic/ }));
    const input = await screen.findByLabelText("Valor hoje");
    expect(input).toHaveValue("1850,00");
    await userEvent.clear(input);
    await userEvent.type(input, "1.870,00");
    await userEvent.click(screen.getByRole("button", { name: "Salvar valor" }));
    expect(postInvestment).toHaveBeenCalledWith(
      { name: "Tesouro Selic 2029", subtitle: "Tesouro Direto", amount: "1.870,00" },
      "b",
    );
  });
});
