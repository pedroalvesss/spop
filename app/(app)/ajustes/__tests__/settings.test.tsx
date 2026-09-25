import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountsCard } from "../_components/AccountsCard";
import { CategoriesCard } from "../_components/CategoriesCard";
import { ModulesCard } from "../_components/ModulesCard";
import { PreferencesCard } from "../_components/PreferencesCard";

const actions = vi.hoisted(() => ({
  postAccount: vi.fn(),
  putAccount: vi.fn(),
  putAccountActive: vi.fn(),
  putUserModule: vi.fn(),
  putUserPreferences: vi.fn(),
  postCategory: vi.fn(),
  deleteCategoryById: vi.fn(),
  postLogout: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/actions/bancosActions/postAccount", () => ({ postAccount: actions.postAccount }));
vi.mock("@/actions/bancosActions/putAccount", () => ({ putAccount: actions.putAccount }));
vi.mock("@/actions/bancosActions/putAccountActive", () => ({
  putAccountActive: actions.putAccountActive,
}));
vi.mock("@/actions/ajustesActions/putUserModule", () => ({ putUserModule: actions.putUserModule }));
vi.mock("@/actions/ajustesActions/putUserPreferences", () => ({
  putUserPreferences: actions.putUserPreferences,
}));
vi.mock("@/actions/categoriasActions/postCategory", () => ({ postCategory: actions.postCategory }));
vi.mock("@/actions/categoriasActions/deleteCategoryById", () => ({
  deleteCategoryById: actions.deleteCategoryById,
}));
vi.mock("@/actions/authActions/postLogout", () => ({ postLogout: actions.postLogout }));
vi.mock("@/components/Toast", () => ({ useToast: () => actions.toast }));

const accounts = [
  { id: "nu", name: "Nubank", color: "#9184d9", active: true, balanceCents: 128437 },
  { id: "inter", name: "Inter", color: "#e0a458", active: false, balanceCents: 0 },
];

beforeEach(() => vi.resetAllMocks());

describe("AccountsCard", () => {
  it("liga e desliga contas na hora", async () => {
    render(<AccountsCard accounts={accounts} />);
    const inter = screen.getByRole("switch", { name: "Inter ativa" });
    expect(inter).toHaveAttribute("data-state", "unchecked");
    await userEvent.click(inter);
    expect(actions.putAccountActive).toHaveBeenCalledWith("inter", true);
  });

  it("adiciona banco novo e limpa o campo", async () => {
    actions.postAccount.mockResolvedValue({ ok: true });
    render(<AccountsCard accounts={accounts} />);
    const input = screen.getByLabelText("Novo banco ou carteira");
    await userEvent.type(input, "VR");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    expect(actions.postAccount).toHaveBeenCalledWith({ name: "VR" });
    expect(actions.toast).toHaveBeenCalledWith("VR adicionado.");
    expect(input).toHaveValue("");
  });

  it("edita o saldo de hoje", async () => {
    actions.putAccount.mockResolvedValue({ ok: true });
    render(<AccountsCard accounts={accounts} />);
    await userEvent.click(screen.getByRole("button", { name: /Nubank/ }));
    const balance = await screen.findByLabelText("Saldo hoje");
    expect(balance).toHaveValue("1284,37");
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(actions.putAccount).toHaveBeenCalledWith("nu", { name: "Nubank", balance: "1284,37" });
  });
});

describe("ModulesCard", () => {
  it("mostra um switch por módulo e salva a troca", async () => {
    render(<ModulesCard modules={["tx", "budget"]} />);
    expect(screen.getAllByRole("switch")).toHaveLength(8);
    await userEvent.click(screen.getByRole("switch", { name: "Metas" }));
    expect(actions.putUserModule).toHaveBeenCalledWith({ module: "goals", enabled: true });
  });
});

describe("PreferencesCard", () => {
  it("salva esconder valores ao abrir e troca o dia do salário", async () => {
    actions.putUserPreferences.mockResolvedValue({ ok: true });
    render(
      <PreferencesCard hideValuesOnOpen={false} billCreatesTransaction={false} salaryDay={5} />,
    );
    await userEvent.click(screen.getByRole("switch", { name: "Esconder valores ao abrir" }));
    expect(actions.putUserPreferences).toHaveBeenCalledWith({ hideValuesOnOpen: true });
    await userEvent.click(screen.getByRole("button", { name: /Dia do salário/ }));
    const day = await screen.findByLabelText("Cai todo dia");
    await userEvent.clear(day);
    await userEvent.type(day, "30");
    await userEvent.click(screen.getAllByRole("button", { name: "Salvar" }).at(-1)!);
    expect(actions.putUserPreferences).toHaveBeenCalledWith({ salaryDay: 30 });
  });
});

describe("CategoriesCard", () => {
  it("cria categoria de entrada sem orçamento", async () => {
    actions.postCategory.mockResolvedValue({ ok: true });
    render(<CategoriesCard categories={[]} />);
    await userEvent.click(screen.getByRole("button", { name: "Nova categoria" }));
    await userEvent.click(await screen.findByRole("button", { name: "Entrada" }));
    expect(screen.queryByLabelText(/Orçamento/)).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Nome"), "Vale-refeição");
    await userEvent.click(screen.getByRole("button", { name: "Criar categoria" }));
    expect(actions.postCategory).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Vale-refeição", type: "income" }),
      undefined,
    );
  });
});
