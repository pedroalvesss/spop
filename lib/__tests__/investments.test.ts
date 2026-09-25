import { describe, expect, it } from "vitest";
import { allocationColor, monthYield, rebase, yieldLine } from "../investments";

const nbsp = (s: string) => s.replace(/ /g, " ");

describe("investimentos", () => {
  it("soma o rendimento só de quem tem base no mês", () => {
    expect(
      monthYield(
        [
          { amountCents: 320000, baseCents: 315180, baseMonth: "2026-09" },
          { amountCents: 185000, baseCents: 180000, baseMonth: "2026-08" },
        ],
        "2026-09",
      ),
    ).toBe(4820);
  });

  it("ao atualizar num mês novo, o valor antigo vira base", () => {
    const inv = { amountCents: 100000, baseCents: 90000, baseMonth: "2026-08" };
    expect(rebase(inv, 101000, "2026-09")).toEqual({
      amountCents: 101000,
      baseCents: 100000,
      baseMonth: "2026-09",
    });
    expect(rebase({ ...inv, baseMonth: "2026-09" }, 102000, "2026-09").baseCents).toBe(90000);
  });

  it("converte o rendimento em pastéis", () => {
    expect(nbsp(yieldLine(4820))).toBe("+R$ 48,20 este mês · paga uns 3 pastéis");
    expect(nbsp(yieldLine(1600))).toBe("+R$ 16,00 este mês · paga um pastel");
    expect(nbsp(yieldLine(-500))).toBe("−R$ 5,00 este mês · ainda não paga um pastel");
  });

  it("repete as cores da alocação em ordem", () => {
    expect(allocationColor(0)).toBe("bg-accent");
    expect(allocationColor(5)).toBe("bg-accent");
  });
});
