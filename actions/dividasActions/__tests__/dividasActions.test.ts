import { beforeEach, describe, expect, it, vi } from "vitest";
import { postDebtPayment } from "../postDebtPayment";
import { postDebt } from "../postDebt";

const { db, tx } = vi.hoisted(() => {
  const tx = { debt: { update: vi.fn() }, transaction: { create: vi.fn() } };
  return {
    tx,
    db: {
      debt: { findFirst: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
      account: { findFirst: vi.fn() },
      category: { findMany: vi.fn() },
      $transaction: vi.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
    },
  };
});
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/session", () => ({ getUserId: async () => "u1" }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const notebook = {
  id: "d1",
  name: "Notebook",
  installmentCents: 38900,
  totalInstallments: 10,
  paidInstallments: 7,
  accountId: "nu",
  categoryId: "outros",
  cardId: "c1",
};

beforeEach(() => vi.clearAllMocks());

describe("postDebtPayment", () => {
  it("compra parcelada: soma a parcela e lança no cartão", async () => {
    db.debt.findFirst.mockResolvedValue(notebook);
    await postDebtPayment("d1");
    expect(tx.debt.update).toHaveBeenCalledWith({
      where: { id: "d1" },
      data: { paidInstallments: 8 },
    });
    expect(tx.transaction.create.mock.calls[0][0].data).toMatchObject({
      description: "Notebook (8/10)",
      amountCents: -38900,
      cardId: "c1",
      debtId: "d1",
    });
  });

  it("dívida sem conta só conta a parcela", async () => {
    db.debt.findFirst.mockResolvedValue({ ...notebook, accountId: null, categoryId: null });
    await postDebtPayment("d1");
    expect(tx.transaction.create).not.toHaveBeenCalled();
  });

  it("não passa do total", async () => {
    db.debt.findFirst.mockResolvedValue({ ...notebook, paidInstallments: 10 });
    await postDebtPayment("d1");
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});

describe("postDebt", () => {
  const input = {
    name: "Empréstimo",
    subtitle: "",
    icon: "bank",
    installment: "318,40",
    totalInstallments: 12,
    paidInstallments: 5,
    accountId: "nu",
  };

  it("não aceita mais parcelas pagas do que o total", async () => {
    const result = await postDebt({ ...input, paidInstallments: 13 });
    expect(result).toEqual({ ok: false, error: "Pagou mais parcelas do que existem? Confere aí." });
  });

  it("com conta, usa a categoria Outros pros lançamentos das parcelas", async () => {
    db.account.findFirst.mockResolvedValue({ id: "nu" });
    db.category.findMany.mockResolvedValue([
      { id: "mercado", name: "Mercado" },
      { id: "outros", name: "Outros" },
    ]);
    await postDebt(input);
    expect(db.debt.create.mock.calls[0][0].data).toMatchObject({
      installmentCents: 31840,
      subtitle: "12 parcelas",
      accountId: "nu",
      categoryId: "outros",
    });
  });
});
