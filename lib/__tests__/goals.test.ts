import { describe, expect, it } from "vitest";
import { goalLine, goalProgress } from "../goals";

const nbsp = (s: string) => s.replace(/ /g, " ");

describe("metas", () => {
  it("calcula o % limitado a 100", () => {
    expect(goalProgress({ targetCents: 150000, currentCents: 112000 })).toEqual({
      ratio: 112000 / 150000,
      pct: "75%",
    });
    expect(goalProgress({ targetCents: 1000, currentCents: 5000 }).pct).toBe("100%");
  });

  it("conta o que falta em cafés", () => {
    expect(nbsp(goalLine({ targetCents: 150000, currentCents: 112000 }))).toBe(
      "Faltam R$ 380,00, ou uns 55 cafés",
    );
  });

  it("comemora a meta batida", () => {
    expect(goalLine({ targetCents: 1000, currentCents: 1000 })).toBe(
      "Meta batida. Pode comemorar (com moderação).",
    );
  });
});
