import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncBankConnection } from "../bankSync";

const { db, pluggy, notifyBudgetAlert } = vi.hoisted(() => ({
  db: {
    bankConnection: { findUnique: vi.fn(), update: vi.fn() },
    category: { findMany: vi.fn() },
    transaction: {
      findMany: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
      aggregate: vi.fn(),
    },
    account: { updateMany: vi.fn() },
    $transaction: vi.fn(),
  },
  pluggy: { accounts: vi.fn(), transactions: vi.fn() },
  notifyBudgetAlert: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/budgetNotifier", () => ({ notifyBudgetAlert }));
vi.mock("@/services/pluggyService/getPluggyAccounts", () => ({
  getPluggyAccounts: pluggy.accounts,
}));
vi.mock("@/services/pluggyService/getPluggyTransactions", () => ({
  getPluggyTransactions: pluggy.transactions,
}));

const at = (day: string) => `${day}T15:00:00.000Z`;

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-09-25T18:00:00Z"));
  db.bankConnection.findUnique.mockResolvedValue({
    itemId: "item",
    accountId: "nu",
    cardId: "roxinho",
    card: { accountId: "nu" },
    since: new Date("2026-09-01T00:00:00Z"),
  });
  db.category.findMany.mockResolvedValue([
    { id: "comer", name: "Comer fora", type: "expense" },
    { id: "outros", name: "Outros", type: "expense" },
    { id: "pix", name: "Pix recebido", type: "income" },
  ]);
  pluggy.accounts.mockResolvedValue([
    { id: "conta", type: "BANK", balance: 1234.56 },
    { id: "cartao", type: "CREDIT", balance: 800 },
  ]);
  db.transaction.aggregate.mockResolvedValue({ _sum: { amountCents: -10000 } });
  pluggy.transactions.mockImplementation(async (id: string) =>
    id === "conta"
      ? [
          { id: "t1", description: "Pix recebido Fulano", amount: 50, date: at("2026-09-24") },
          { id: "t2", description: "Pix enviado", amount: -30, date: at("2026-09-20") },
          { id: "t3", description: "Pagamento de fatura", amount: -900, date: at("2026-09-10") },
        ]
      : [
          { id: "c1", description: "IFOOD", amount: 42.9, date: at("2026-09-25") },
          { id: "c2", description: "Loja (futura)", amount: 10, date: at("2026-10-25") },
        ],
  );
  db.transaction.findMany.mockResolvedValue([
    { id: "old2", externalId: "t2", amountCents: -2500, date: new Date("2026-09-20T00:00:00Z") },
    { id: "sumiu", externalId: "t9", amountCents: -100, date: new Date("2026-09-15T00:00:00Z") },
  ]);
});

afterEach(() => vi.useRealTimers());

describe("syncBankConnection", () => {
  it("cria só o que é novo, atualiza valor mudado e apaga o que sumiu", async () => {
    expect(await syncBankConnection("u1")).toEqual({ imported: 2 });

    const created = db.transaction.createMany.mock.calls[0][0];
    expect(created.skipDuplicates).toBe(true);
    expect(created.data).toEqual([
      expect.objectContaining({ externalId: "t1", amountCents: 5000, categoryId: "pix" }),
      expect.objectContaining({
        externalId: "c1",
        amountCents: -4290,
        categoryId: "comer",
        cardId: "roxinho",
        accountId: "nu",
      }),
    ]);
    expect(db.transaction.update).toHaveBeenCalledWith({
      where: { id: "old2" },
      data: { amountCents: -3000, date: new Date("2026-09-20T00:00:00Z") },
    });
    expect(db.transaction.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ["sumiu"] } } });
  });

  it("busca desde a data da conexão e avisa do orçamento", async () => {
    await syncBankConnection("u1");
    expect(pluggy.transactions).toHaveBeenCalledWith("conta", "2026-09-01");
    expect(notifyBudgetAlert).toHaveBeenCalledWith("u1", "comer", "2026-09", 4290);
  });

  it("ajusta o saldo inicial pra conta fechar com o saldo do banco", async () => {
    await syncBankConnection("u1");
    expect(db.account.updateMany).toHaveBeenCalledWith({
      where: { id: "nu", userId: "u1" },
      data: { initialBalanceCents: 123456 + 10000 },
    });
  });

  it("sem cartão ligado, ignora a conta de crédito", async () => {
    db.bankConnection.findUnique.mockResolvedValue({
      itemId: "item",
      accountId: "nu",
      cardId: null,
      card: null,
      since: new Date("2026-09-01T00:00:00Z"),
    });
    await syncBankConnection("u1");
    expect(pluggy.transactions).not.toHaveBeenCalledWith("cartao", expect.anything());
  });

  it("não apaga nada quando a Pluggy volta vazia", async () => {
    pluggy.transactions.mockResolvedValue([]);
    await syncBankConnection("u1");
    expect(db.transaction.deleteMany).toHaveBeenCalledWith({ where: { id: { in: [] } } });
  });
});
