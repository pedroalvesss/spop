import { beforeEach, describe, expect, it, vi } from "vitest";
import { postInvestment } from "../postInvestment";

const { db } = vi.hoisted(() => ({
  db: { investment: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn() } },
}));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/session", () => ({ getUserId: async () => "u1" }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/dates", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/dates")>()),
  todayISO: () => "2026-09-24",
}));

beforeEach(() => vi.clearAllMocks());

describe("postInvestment", () => {
  it("novo investimento começa com base igual ao valor (sem rendimento)", async () => {
    await postInvestment({ name: "FIIs", subtitle: "", amount: "640,00" });
    expect(db.investment.create.mock.calls[0][0].data).toMatchObject({
      amountCents: 64000,
      baseCents: 64000,
      baseMonth: "2026-09",
    });
  });

  it("primeira atualização do mês guarda o valor antigo como base", async () => {
    db.investment.findFirst.mockResolvedValue({
      amountCents: 315180,
      baseCents: 300000,
      baseMonth: "2026-08",
    });
    await postInvestment({ name: "Caixinha", subtitle: "", amount: "3.200,00" }, "i1");
    expect(db.investment.update.mock.calls[0][0].data).toMatchObject({
      amountCents: 320000,
      baseCents: 315180,
      baseMonth: "2026-09",
    });
  });

  it("não atualiza investimento de outra pessoa", async () => {
    db.investment.findFirst.mockResolvedValue(null);
    const result = await postInvestment({ name: "X", subtitle: "", amount: "1" }, "i1");
    expect(result.ok).toBe(false);
    expect(db.investment.update).not.toHaveBeenCalled();
  });
});
