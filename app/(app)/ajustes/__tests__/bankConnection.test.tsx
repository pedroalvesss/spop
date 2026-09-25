import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BankConnectionCard } from "../_components/BankConnectionCard";

const actions = vi.hoisted(() => ({
  postBankConnection: vi.fn(),
  postBankSync: vi.fn(),
  deleteBankConnection: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/actions/bancosActions/postBankConnection", () => ({
  postBankConnection: actions.postBankConnection,
}));
vi.mock("@/actions/bancosActions/postBankSync", () => ({ postBankSync: actions.postBankSync }));
vi.mock("@/actions/bancosActions/deleteBankConnection", () => ({
  deleteBankConnection: actions.deleteBankConnection,
}));
vi.mock("@/components/Toast", () => ({ useToast: () => actions.toast }));

const ITEM = "8d4b5c1e-2f3a-4b6c-9d7e-0a1b2c3d4e5f";
const props = {
  accounts: [{ id: "nu", name: "Nubank" }],
  cards: [{ id: "roxinho", name: "Roxinho" }],
  today: "2026-09-25",
};

beforeEach(() => vi.clearAllMocks());

describe("BankConnectionCard", () => {
  it("conecta com o Item ID, a conta e o cartão", async () => {
    actions.postBankConnection.mockResolvedValue({ ok: true, imported: 3 });
    render(<BankConnectionCard connection={null} {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Conectar banco" }));
    await userEvent.type(screen.getByLabelText("Item ID da Pluggy"), ITEM);
    await userEvent.click(screen.getByRole("button", { name: "Conectar" }));

    await waitFor(() =>
      expect(actions.postBankConnection).toHaveBeenCalledWith({
        itemId: ITEM,
        accountId: "nu",
        cardId: "roxinho",
        since: "2026-09-25",
      }),
    );
    expect(actions.toast).toHaveBeenCalledWith("Banco conectado. 3 lançamentos novos.");
  });

  it("mostra o erro do Item ID sem chamar o servidor", async () => {
    render(<BankConnectionCard connection={null} {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Conectar banco" }));
    await userEvent.type(screen.getByLabelText("Item ID da Pluggy"), "abc");
    await userEvent.click(screen.getByRole("button", { name: "Conectar" }));
    expect(await screen.findByText(/Item ID não parece certo/)).toBeVisible();
    expect(actions.postBankConnection).not.toHaveBeenCalled();
  });

  it("conectado: mostra o resumo e sincroniza na hora", async () => {
    actions.postBankSync.mockResolvedValue({ ok: true, imported: 0 });
    const connection = {
      bankName: "Nubank",
      itemId: ITEM,
      accountId: "nu",
      cardId: "roxinho",
      since: "2026-09-25",
      summary: "Nubank · cartão Roxinho",
      synced: "Atualizado hoje às 08:12",
    };
    render(<BankConnectionCard connection={connection} {...props} />);
    expect(screen.getByText("Nubank · cartão Roxinho · Atualizado hoje às 08:12")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Sincronizar agora" }));
    await waitFor(() => expect(actions.toast).toHaveBeenCalledWith("Nada novo por enquanto."));
  });
});
