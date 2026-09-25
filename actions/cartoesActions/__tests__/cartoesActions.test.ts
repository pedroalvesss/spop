import { beforeEach, describe, expect, it, vi } from "vitest";
import { postCard } from "../postCard";
import { deleteCardById } from "../deleteCardById";

const { db } = vi.hoisted(() => ({
  db: {
    account: { findFirst: vi.fn() },
    creditCard: { create: vi.fn(), updateMany: vi.fn() },
  },
}));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/session", () => ({ getUserId: async () => "u1" }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const input = {
  name: "Nubank",
  last4: "4821",
  limit: "4.000,00",
  closingDay: 3,
  dueDay: 10,
  accountId: "nu",
};

beforeEach(() => vi.clearAllMocks());

describe("postCard", () => {
  it("recusa banco de outra pessoa", async () => {
    db.account.findFirst.mockResolvedValue(null);
    expect(await postCard(input)).toEqual({ ok: false, error: "Banco não encontrado." });
  });

  it("cria com limite em centavos", async () => {
    db.account.findFirst.mockResolvedValue({ id: "nu" });
    await postCard(input);
    expect(db.creditCard.create.mock.calls[0][0].data).toMatchObject({
      userId: "u1",
      limitCents: 400000,
      closingDay: 3,
    });
  });

  it("edita só cartão da pessoa", async () => {
    db.account.findFirst.mockResolvedValue({ id: "nu" });
    await postCard(input, "c1");
    expect(db.creditCard.updateMany.mock.calls[0][0].where).toEqual({ id: "c1", userId: "u1" });
  });
});

describe("deleteCardById", () => {
  it("desativa em vez de apagar", async () => {
    await deleteCardById("c1");
    expect(db.creditCard.updateMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "u1" },
      data: { active: false },
    });
  });
});
