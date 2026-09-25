import { beforeEach, describe, expect, it, vi } from "vitest";
import { postBillPayment } from "../postBillPayment";
import { postBill } from "../postBill";
import { deleteBillById } from "../deleteBillById";

const { db, tx } = vi.hoisted(() => {
  const tx = { transaction: { create: vi.fn() }, billPayment: { create: vi.fn() } };
  return {
    tx,
    db: {
      bill: { findFirst: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
      billPayment: { delete: vi.fn() },
      transaction: { deleteMany: vi.fn() },
      category: { findFirst: vi.fn() },
      account: { findFirst: vi.fn() },
      $transaction: vi.fn((arg: unknown) =>
        typeof arg === "function" ? (arg as (t: typeof tx) => unknown)(tx) : arg,
      ),
    },
  };
});
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/session", () => ({ getUserId: async () => "u1" }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/dates", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/dates")>()),
  todayISO: () => "2026-09-24",
}));

const baseBill = {
  id: "b1",
  name: "Internet",
  amountCents: 9990,
  categoryId: "cat",
  accountId: "acc",
  payments: [],
  user: { billCreatesTransaction: false },
};

beforeEach(() => vi.clearAllMocks());

describe("postBillPayment", () => {
  it("marca como paga no mês atual", async () => {
    db.bill.findFirst.mockResolvedValue(baseBill);
    await postBillPayment("b1");
    expect(tx.billPayment.create).toHaveBeenCalledWith({
      data: { billId: "b1", month: "2026-09", transactionId: null },
    });
    expect(tx.transaction.create).not.toHaveBeenCalled();
  });

  it("com a preferência ligada, também lança a saída", async () => {
    db.bill.findFirst.mockResolvedValue({ ...baseBill, user: { billCreatesTransaction: true } });
    tx.transaction.create.mockResolvedValue({ id: "t1" });
    await postBillPayment("b1");
    expect(tx.transaction.create.mock.calls[0][0].data).toMatchObject({
      amountCents: -9990,
      description: "Internet",
    });
    expect(tx.billPayment.create.mock.calls[0][0].data.transactionId).toBe("t1");
  });

  it("desmarcar apaga o pagamento e o lançamento gerado", async () => {
    db.bill.findFirst.mockResolvedValue({
      ...baseBill,
      payments: [{ id: "p1", transactionId: "t1" }],
    });
    await postBillPayment("b1");
    expect(db.billPayment.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
    expect(db.transaction.deleteMany).toHaveBeenCalledWith({ where: { id: "t1", userId: "u1" } });
  });

  it("ignora conta de outra pessoa", async () => {
    db.bill.findFirst.mockResolvedValue(null);
    await postBillPayment("b1");
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});

describe("postBill e deleteBillById", () => {
  const input = {
    name: "Água",
    icon: "drop",
    amount: "80,00",
    dueDay: 10,
    categoryId: "cat",
    accountId: "acc",
  };

  it("descarta categoria e conta que não são da pessoa", async () => {
    db.category.findFirst.mockResolvedValue(null);
    db.account.findFirst.mockResolvedValue({ id: "acc" });
    await postBill(input);
    expect(db.bill.create.mock.calls[0][0].data).toMatchObject({
      userId: "u1",
      amountCents: 8000,
      categoryId: null,
      accountId: "acc",
    });
  });

  it("valida o dia do vencimento", async () => {
    expect(await postBill({ ...input, dueDay: 40 })).toEqual({
      ok: false,
      error: "O dia vai de 1 a 31.",
    });
  });

  it("apagar só desativa", async () => {
    await deleteBillById("b1");
    expect(db.bill.updateMany).toHaveBeenCalledWith({
      where: { id: "b1", userId: "u1" },
      data: { active: false },
    });
  });
});
