import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HideValuesProvider } from "@/components/HideValues";
import { MODULE_IDS } from "@/lib/tabs";
import { AppHeader } from "../_components/AppHeader";
import { Sidebar } from "../_components/Sidebar";
import { TabBar } from "../_components/TabBar";

const nav = vi.hoisted(() => ({ pathname: "/" }));
const openNew = vi.fn();

vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));
vi.mock("@/actions/authActions/postLogout", () => ({ postLogout: vi.fn() }));
vi.mock("../_contexts/TransactionDialogContext", () => ({
  useTransactionDialog: () => ({ openNew, openEdit: vi.fn() }),
}));

beforeEach(() => {
  nav.pathname = "/";
  openNew.mockClear();
});

describe("AppHeader", () => {
  it("no Início mostra saudação e dia do salário", () => {
    render(
      <AppHeader userName="Pedro" homeSub="Quinta, 24 de setembro · faltam 6 dias pro salário" />,
    );
    expect(screen.getByRole("heading")).toHaveTextContent("Oi, Pedro");
    expect(screen.getByText(/faltam 6 dias/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ajustes" })).toHaveTextContent("P");
  });

  it("nas outras abas mostra título e subtítulo da aba", () => {
    nav.pathname = "/orcamento";
    render(<AppHeader userName="Pedro" homeSub="" />);
    expect(screen.getByRole("heading")).toHaveTextContent("Orçamento");
    expect(screen.getByText("O que você prometeu gastar vs. o que gastou")).toBeInTheDocument();
  });

  it("o olho alterna entre mostrar e ocultar", async () => {
    render(
      <HideValuesProvider initialHidden={false}>
        <AppHeader userName="Pedro" homeSub="" />
      </HideValuesProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Ocultar valores" }));
    expect(screen.getByRole("button", { name: "Mostrar valores" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

describe("Sidebar", () => {
  it("lista só os módulos ligados e marca o ativo", () => {
    nav.pathname = "/metas";
    render(<Sidebar userName="Pedro" modules={["goals"]} />);
    const links = screen.getAllByRole("link").map((l) => l.textContent);
    expect(links).toEqual(["Início", "Metas", "Ajustes"]);
    expect(screen.getByRole("link", { name: "Metas" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Plano: gratuito (óbvio)")).toBeInTheDocument();
  });

  it("abre o lançamento pelo botão", async () => {
    render(<Sidebar userName="Pedro" modules={[]} />);
    await userEvent.click(screen.getByRole("button", { name: "Novo lançamento" }));
    expect(openNew).toHaveBeenCalled();
  });
});

describe("TabBar", () => {
  it("tem Início, dois módulos, + e Mais", async () => {
    render(<TabBar modules={[...MODULE_IDS]} />);
    expect(screen.getAllByRole("link").map((l) => l.textContent)).toEqual([
      "Início",
      "Extrato",
      "Orçamento",
    ]);
    await userEvent.click(screen.getByRole("button", { name: "Novo lançamento" }));
    expect(openNew).toHaveBeenCalled();
  });

  it("o Mais abre a grade com o resto e Ajustes", async () => {
    render(<TabBar modules={[...MODULE_IDS]} />);
    await userEvent.click(screen.getByRole("button", { name: "Mais" }));
    expect(await screen.findByRole("dialog", { name: "Tudo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contas a pagar" })).toHaveAttribute("href", "/contas");
    expect(screen.getByRole("link", { name: "Ajustes" })).toBeInTheDocument();
  });
});
