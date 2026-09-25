import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BudgetRow } from "@/lib/budget";
import { BudgetList } from "../_components/BudgetList";

const { putCategoryBudget, toast } = vi.hoisted(() => ({
  putCategoryBudget: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/actions/categoriasActions/putCategoryBudget", () => ({ putCategoryBudget }));
vi.mock("@/components/Toast", () => ({ useToast: () => toast }));

const rows: BudgetRow[] = [
  {
    id: "lazer",
    name: "Lazer",
    icon: "game-controller",
    budgetCents: 20000,
    spentCents: 22399,
    ratio: 1.12,
  },
  {
    id: "mercado",
    name: "Mercado",
    icon: "shopping-cart",
    budgetCents: 60000,
    spentCents: 51817,
    ratio: 0.86,
  },
  {
    id: "saude",
    name: "Saúde",
    icon: "first-aid-kit",
    budgetCents: 15000,
    spentCents: 3850,
    ratio: 0.26,
  },
];

const nbsp = (s: string | null | undefined) => s?.replace(/ /g, " ");

beforeEach(() => vi.clearAllMocks());

describe("BudgetList", () => {
  it("marca estourou e quase lá e mostra o que sobra ou passou", () => {
    render(<BudgetList rows={rows} />);
    expect(screen.getByText("Estourou")).toBeInTheDocument();
    expect(screen.getByText("Quase lá")).toBeInTheDocument();
    expect(nbsp(screen.getByText(/acima$/).textContent)).toBe("R$ 23,99 acima");
    expect(nbsp(screen.getByText(/^sobram R\$\s111,50$/).textContent)).toBe("sobram R$ 111,50");
  });

  it("pinta a barra conforme o status", () => {
    render(<BudgetList rows={rows} />);
    const fills = screen.getAllByRole("progressbar").map((bar) => bar.firstElementChild);
    expect(fills[0]).toHaveClass("bg-expense");
    expect(fills[1]).toHaveClass("bg-warn");
    expect(fills[2]).toHaveClass("bg-accent");
  });

  it("edita o orçamento da categoria", async () => {
    render(<BudgetList rows={rows} />);
    await userEvent.click(screen.getByRole("button", { name: "Editar orçamento de Lazer" }));
    const input = await screen.findByLabelText("Quanto dá pra gastar por mês");
    expect(input).toHaveValue("200,00");
    await userEvent.clear(input);
    await userEvent.type(input, "250");
    await userEvent.click(screen.getByRole("button", { name: "Salvar orçamento" }));
    expect(putCategoryBudget).toHaveBeenCalledWith("lazer", { amount: "250" });
    expect(toast).toHaveBeenCalledWith("Orçamento de Lazer atualizado. Agora é cumprir.");
  });
});
