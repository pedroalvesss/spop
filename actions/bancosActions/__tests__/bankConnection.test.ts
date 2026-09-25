import { beforeEach, describe, expect, it, vi } from "vitest";
import { postBankConnection } from "../postBankConnection";
import { postBankSync } from "../postBankSync";

const { db, getPluggyItem, syncBankConnection } = vi.hoisted(() => ({
  db: {
    account: { findFirst: vi.fn() },
    creditCard: { findFirst: vi.fn() },
    bankConnection: { findUnique: vi.fn(), upsert: vi.fn() },
  },
  getPluggyItem: vi.fn(),
  syncBankConnection: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/session", () => ({ getUserId: async () => "u1" }));
vi.mock("@/lib/pluggy", () => ({ pluggyEnabled: () => true }));
vi.mock("@/lib/bankSync", () => ({ syncBankConnection }));
vi.mock("@/services/pluggyService/getPluggyItem", () => ({ getPluggyItem }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const ITEM = "8d4b5c1e-2f3a-4b6c-9d7e-0a1b2c3d4e5f";
const input = { itemId: ` ${ITEM} `, accountId: "nu", cardId: "roxinho", since: "2026-09-25" };

beforeEach(() => {
  vi.resetAllMocks();
  db.account.findFirst.mockResolvedValue({ id: "nu" });
  db.creditCard.findFirst.mockResolvedValue({ id: "roxinho" });
  db.bankConnection.findUnique.mockResolvedValue(null);
  getPluggyItem.mockResolvedValue({ id: ITEM, connector: { name: "Nubank" } });
  syncBankConnection.mockResolvedValue({ imported: 4 });
});

describe("postBankConnection", () => {
  it("recusa Item ID que não é UUID", async () => {
    const result = await postBankConnection({ ...input, itemId: "abc" });
    expect(result.ok).toBe(false);
    expect(getPluggyItem).not.toHaveBeenCalled();
  });

  it("recusa cartão de outra pessoa e banco já ligado em outra conta", async () => {
    db.creditCard.findFirst.mockResolvedValue(null);
    expect(await postBankConnection(input)).toEqual({
      ok: false,
      error: "Conta ou cartão não encontrado.",
    });
    db.creditCard.findFirst.mockResolvedValue({ id: "roxinho" });
    db.bankConnection.findUnique.mockResolvedValue({ userId: "u2" });
    expect(await postBankConnection(input)).toMatchObject({ ok: false });
  });

  it("recusa item que a Pluggy não conhece", async () => {
    getPluggyItem.mockResolvedValue(null);
    expect(await postBankConnection(input)).toEqual({
      ok: false,
      error: "Não achei essa conexão na Pluggy. Confere o Item ID.",
    });
  });

  it("guarda a conexão com o nome do banco e já sincroniza", async () => {
    expect(await postBankConnection(input)).toEqual({ ok: true, imported: 4 });
    const { where, create } = db.bankConnection.upsert.mock.calls[0][0];
    expect(where).toEqual({ userId: "u1" });
    expect(create).toMatchObject({
      userId: "u1",
      itemId: ITEM,
      bankName: "Nubank",
      cardId: "roxinho",
    });
    expect(syncBankConnection).toHaveBeenCalledWith("u1");
  });
});

describe("postBankSync", () => {
  it("devolve erro amigável quando a Pluggy falha", async () => {
    syncBankConnection.mockRejectedValue(new Error("500"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await postBankSync()).toMatchObject({ ok: false });
  });
});
