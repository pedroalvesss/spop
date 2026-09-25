import { beforeEach, describe, expect, it, vi } from "vitest";
import { putUserModule } from "../putUserModule";
import { putUserPreferences } from "../putUserPreferences";
import { putAccount } from "../../bancosActions/putAccount";
import { postAccount } from "../../bancosActions/postAccount";
import { postCategory } from "../../categoriasActions/postCategory";

const { db } = vi.hoisted(() => ({
  db: {
    user: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
    account: { count: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
    transaction: { aggregate: vi.fn() },
    category: { create: vi.fn(), updateMany: vi.fn() },
  },
}));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/session", () => ({ getUserId: async () => "u1" }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe("putUserModule", () => {
  it("mantém a ordem do app ao religar um módulo", async () => {
    db.user.findUniqueOrThrow.mockResolvedValue({ modules: ["budget", "goals"] });
    await putUserModule({ module: "tx", enabled: true });
    expect(db.user.update.mock.calls[0][0].data.modules).toEqual(["tx", "budget", "goals"]);
  });

  it("recusa módulo que não existe", async () => {
    await expect(putUserModule({ module: "x" as never, enabled: true })).rejects.toThrow();
  });
});

describe("putUserPreferences", () => {
  it("salva só o que veio e valida o dia do salário", async () => {
    await putUserPreferences({ hideValuesOnOpen: true });
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { hideValuesOnOpen: true },
    });
    expect((await putUserPreferences({ salaryDay: 0 })).ok).toBe(false);
  });
});

describe("contas", () => {
  it("conta nova ganha cor da paleta da marca", async () => {
    db.account.count.mockResolvedValue(1);
    await postAccount({ name: "Inter" });
    expect(db.account.create.mock.calls[0][0].data).toEqual({
      userId: "u1",
      name: "Inter",
      color: "#9397ab",
    });
  });

  it("ajusta o saldo inicial pra bater com o saldo de hoje", async () => {
    db.transaction.aggregate.mockResolvedValue({ _sum: { amountCents: -50000 } });
    await putAccount("nu", { name: "Nubank", balance: "1.000,00" });
    expect(db.account.updateMany.mock.calls[0][0].data).toEqual({
      name: "Nubank",
      initialBalanceCents: 150000,
    });
  });

  it("aceita saldo negativo", async () => {
    db.transaction.aggregate.mockResolvedValue({ _sum: { amountCents: 0 } });
    await putAccount("nu", { name: "Nubank", balance: "-120,00" });
    expect(db.account.updateMany.mock.calls[0][0].data.initialBalanceCents).toBe(-12000);
  });
});

describe("postCategory", () => {
  it("categoria de entrada nunca tem orçamento", async () => {
    await postCategory({ name: "Bico", icon: "star", type: "income", budget: "100" });
    expect(db.category.create.mock.calls[0][0].data.monthlyBudgetCents).toBeNull();
  });
});
