import { beforeEach, describe, expect, it, vi } from "vitest";
import { postGoalMove } from "../postGoalMove";
import { postGoal } from "../postGoal";

const { db } = vi.hoisted(() => ({
  db: { goal: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn(), updateMany: vi.fn() } },
}));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/session", () => ({ getUserId: async () => "u1" }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe("postGoalMove", () => {
  it("guarda somando ao saldo", async () => {
    db.goal.findFirst.mockResolvedValue({ currentCents: 112000 });
    await postGoalMove("g1", { direction: "in", amount: "50,00" });
    expect(db.goal.update).toHaveBeenCalledWith({
      where: { id: "g1" },
      data: { currentCents: 117000 },
    });
  });

  it("resgate não deixa negativo", async () => {
    db.goal.findFirst.mockResolvedValue({ currentCents: 1000 });
    await postGoalMove("g1", { direction: "out", amount: "50,00" });
    expect(db.goal.update.mock.calls[0][0].data.currentCents).toBe(0);
  });

  it("ignora caixinha de outra pessoa", async () => {
    db.goal.findFirst.mockResolvedValue(null);
    await postGoalMove("g1", { direction: "in", amount: "50,00" });
    expect(db.goal.update).not.toHaveBeenCalled();
  });
});

describe("postGoal", () => {
  it("cria com valores em centavos", async () => {
    await postGoal({ name: "Reserva", icon: "umbrella", target: "10.000", current: "" });
    expect(db.goal.create.mock.calls[0][0].data).toEqual({
      name: "Reserva",
      icon: "umbrella",
      targetCents: 1000000,
      currentCents: 0,
      userId: "u1",
    });
  });

  it("exige meta maior que zero", async () => {
    const result = await postGoal({ name: "X", icon: "star", target: "0", current: "" });
    expect(result.ok).toBe(false);
  });
});
