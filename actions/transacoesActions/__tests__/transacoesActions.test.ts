import { beforeEach, describe, expect, it, vi } from "vitest";
import { postTransaction } from "../postTransaction";
import { putTransaction } from "../putTransaction";
import { deleteTransactionById } from "../deleteTransactionById";

const { db, tx } = vi.hoisted(() => {
  const tx = { debt: { create: vi.fn() }, transaction: { create: vi.fn() } };
  return {
    tx,
    db: {
      category: { findFirst: vi.fn() },
      account: { findFirst: vi.fn() },
      creditCard: { findFirst: vi.fn() },
      transaction: { create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
      $transaction: vi.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
    },
  };
});

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/session", () => ({ getUserId: async () => "u1" }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const input = {
  type: "out" as const,
  amount: "100,00",
  description: "Mercado",
  categoryId: "cat",
  source: "acc",
  date: "2026-09-24",
  installments: "1",
};

beforeEach(() => {
  vi.clearAllMocks();
  db.category.findFirst.mockResolvedValue({ id: "cat" });
  db.account.findFirst.mockResolvedValue({ id: "acc" });
  db.creditCard.findFirst.mockResolvedValue({ accountId: "acc-do-cartao" });
});

describe("postTransaction", () => {
  it("grava saída como valor negativo em centavos", async () => {
    expect(await postTransaction(input)).toEqual({ ok: true });
    expect(db.transaction.create.mock.calls[0][0].data).toMatchObject({
      userId: "u1",
      accountId: "acc",
      amountCents: -10000,
      cardId: null,
    });
  });

  it("recusa conta ou categoria de outra pessoa", async () => {
    db.category.findFirst.mockResolvedValue(null);
    expect(await postTransaction(input)).toEqual({
      ok: false,
      error: "Conta ou categoria não encontrada.",
    });
    expect(db.transaction.create).not.toHaveBeenCalled();
  });

  it("compra no cartão usa a conta do cartão", async () => {
    await postTransaction({ ...input, source: "card:c1" });
    expect(db.transaction.create.mock.calls[0][0].data).toMatchObject({
      accountId: "acc-do-cartao",
      cardId: "c1",
    });
  });

  it("parcelado cria a dívida e só a 1ª parcela", async () => {
    tx.debt.create.mockResolvedValue({ id: "d1" });
    await postTransaction({
      ...input,
      amount: "1.200,00",
      description: "Notebook",
      installments: "3",
    });
    expect(tx.debt.create.mock.calls[0][0].data).toMatchObject({
      name: "Notebook",
      subtitle: "Parcelado em 3x",
      installmentCents: 40000,
      totalInstallments: 3,
      paidInstallments: 1,
    });
    expect(tx.transaction.create.mock.calls[0][0].data).toMatchObject({
      description: "Notebook (1/3)",
      amountCents: -40000,
      debtId: "d1",
    });
  });

  it("entrada ignora parcelas", async () => {
    await postTransaction({ ...input, type: "in", installments: "5" });
    expect(db.transaction.create.mock.calls[0][0].data.amountCents).toBe(10000);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});

describe("putTransaction e deleteTransactionById", () => {
  it("só edita lançamento da própria pessoa", async () => {
    db.transaction.updateMany.mockResolvedValue({ count: 0 });
    const result = await putTransaction("t1", input);
    expect(db.transaction.updateMany.mock.calls[0][0].where).toEqual({ id: "t1", userId: "u1" });
    expect(result.ok).toBe(false);
  });

  it("apaga filtrando pelo dono", async () => {
    await deleteTransactionById("t1");
    expect(db.transaction.deleteMany).toHaveBeenCalledWith({ where: { id: "t1", userId: "u1" } });
  });
});
