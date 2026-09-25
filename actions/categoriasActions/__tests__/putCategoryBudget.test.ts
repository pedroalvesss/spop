import { beforeEach, describe, expect, it, vi } from "vitest";
import { putCategoryBudget } from "../putCategoryBudget";

const { db } = vi.hoisted(() => ({ db: { category: { updateMany: vi.fn() } } }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/session", () => ({ getUserId: async () => "u1" }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe("putCategoryBudget", () => {
  it("grava em centavos, só em categoria de saída da pessoa", async () => {
    await putCategoryBudget("c1", { amount: "1.600,00" });
    expect(db.category.updateMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "u1", type: "expense" },
      data: { monthlyBudgetCents: 160000 },
    });
  });

  it("zerado tira do orçamento", async () => {
    await putCategoryBudget("c1", { amount: "" });
    expect(db.category.updateMany.mock.calls[0][0].data).toEqual({ monthlyBudgetCents: null });
  });
});
