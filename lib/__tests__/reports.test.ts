import { describe, expect, it } from "vitest";
import { chartBars, flowStats, monthlyFlows, parsePeriod } from "../reports";

describe("relatórios", () => {
  const rows = [
    { date: "2026-09-05", amountCents: 420000 },
    { date: "2026-09-10", amountCents: -100000 },
    { date: "2026-08-05", amountCents: 445000 },
    { date: "2026-08-12", amountCents: -387000 },
    { date: "2026-03-01", amountCents: -999999 },
  ];

  it("agrupa por mês, com zero nos meses sem nada e ignora fora do período", () => {
    expect(monthlyFlows(rows, "2026-09", 3)).toEqual([
      { month: "2026-07", incomeCents: 0, expenseCents: 0 },
      { month: "2026-08", incomeCents: 445000, expenseCents: 387000 },
      { month: "2026-09", incomeCents: 420000, expenseCents: 100000 },
    ]);
  });

  it("escala as barras pelo maior valor (140px)", () => {
    const bars = chartBars(monthlyFlows(rows, "2026-09", 3));
    expect(bars[1]).toMatchObject({ label: "ago", incomePx: 140 });
    expect(bars[2].expensePx).toBe(Math.round((100000 / 445000) * 140));
    expect(bars[0].incomePx).toBe(0);
  });

  it("calcula média e mês mais salgado", () => {
    expect(flowStats(monthlyFlows(rows, "2026-09", 3))).toEqual({
      avgExpenseCents: Math.round(487000 / 3),
      worstLabel: "ago",
      worstCents: 387000,
    });
  });

  it("aceita só 3, 6 ou 12 meses", () => {
    expect(parsePeriod("12")).toBe(12);
    expect(parsePeriod("7")).toBe(6);
    expect(parsePeriod(undefined)).toBe(6);
  });
});
