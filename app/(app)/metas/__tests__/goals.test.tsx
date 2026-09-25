import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HideValuesProvider } from "@/components/HideValues";
import type { GoalDto } from "@/services/metasService/getGoals";
import { GoalsList } from "../_components/GoalsList";
import { GoalsCard } from "../../(inicio)/_components/GoalsCard";

const { postGoalMove, postGoal, deleteGoalById, toast } = vi.hoisted(() => ({
  postGoalMove: vi.fn(),
  postGoal: vi.fn(),
  deleteGoalById: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/actions/metasActions/postGoalMove", () => ({ postGoalMove }));
vi.mock("@/actions/metasActions/postGoal", () => ({ postGoal }));
vi.mock("@/actions/metasActions/deleteGoalById", () => ({ deleteGoalById }));
vi.mock("@/components/Toast", () => ({ useToast: () => toast }));

const trip: GoalDto = {
  id: "g1",
  name: "Viagem pra praia",
  icon: "sun-horizon",
  targetCents: 150000,
  currentCents: 112000,
};

beforeEach(() => vi.resetAllMocks());

describe("GoalsList", () => {
  it("mostra %, quanto falta em cafés e esconde com o olho", () => {
    const { rerender } = render(<GoalsList goals={[trip]} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText(/uns 55 cafés/)).toBeInTheDocument();
    rerender(
      <HideValuesProvider initialHidden>
        <GoalsList goals={[trip]} />
      </HideValuesProvider>,
    );
    expect(screen.getByText("Faltam ••••")).toBeInTheDocument();
  });

  it("guardar usa atalho de valor e comemora", async () => {
    render(<GoalsList goals={[trip]} />);
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));
    const input = await screen.findByLabelText("Quanto");
    expect(input).toHaveValue("50,00");
    await userEvent.click(screen.getByRole("button", { name: /R\$\s100$/ }));
    expect(input).toHaveValue("100,00");
    await userEvent.click(screen.getAllByRole("button", { name: "Guardar" }).at(-1)!);
    expect(postGoalMove).toHaveBeenCalledWith("g1", { direction: "in", amount: "100,00" });
    expect(toast.mock.calls[0][0].replace(/ /g, " ")).toBe(
      "+R$ 100,00 em Viagem pra praia. Orgulho.",
    );
  });

  it("resgatar manda a direção certa", async () => {
    render(<GoalsList goals={[trip]} />);
    await userEvent.click(screen.getByRole("button", { name: "Resgatar" }));
    await userEvent.click((await screen.findAllByRole("button", { name: "Resgatar" })).at(-1)!);
    expect(postGoalMove).toHaveBeenCalledWith("g1", { direction: "out", amount: "50,00" });
  });

  it("cria caixinha nova pelo card tracejado", async () => {
    postGoal.mockResolvedValue({ ok: true });
    render(<GoalsList goals={[]} />);
    await userEvent.click(screen.getByRole("button", { name: "Nova caixinha" }));
    await userEvent.type(await screen.findByLabelText("Nome"), "Reserva");
    await userEvent.type(screen.getByLabelText("Meta"), "10.000");
    await userEvent.click(screen.getByRole("button", { name: "Criar caixinha" }));
    expect(postGoal).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Reserva", target: "10.000" }),
      undefined,
    );
    expect(toast).toHaveBeenCalledWith(
      "Caixinha criada. Agora é só colocar dinheiro (a parte difícil).",
    );
  });
});

describe("GoalsCard do início", () => {
  it("lista as caixinhas com %", () => {
    render(<GoalsCard goals={[trip]} />);
    expect(screen.getByText("Viagem pra praia")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });
});
