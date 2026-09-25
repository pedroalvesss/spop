import { describe, expect, it } from "vitest";
import { centsToInput, formatBRL, formatSigned, parseBRL, splitCents } from "../money";

const nbsp = (s: string) => s.replace(/ /g, " ");

describe("money", () => {
  it("formata em reais", () => {
    expect(nbsp(formatBRL(128437))).toBe("R$ 1.284,37");
    expect(nbsp(formatBRL(0))).toBe("R$ 0,00");
  });

  it("usa + pra entrada e sinal de menos de verdade pra saída", () => {
    expect(nbsp(formatSigned(4500))).toBe("+ R$ 45,00");
    expect(nbsp(formatSigned(-5890))).toBe("− R$ 58,90");
  });

  it("separa os centavos do saldo", () => {
    const [int, cents] = splitCents(128437);
    expect(nbsp(int)).toBe("R$ 1.284");
    expect(cents).toBe(",37");
  });

  it.each([
    ["1.234,56", 123456],
    ["58,9", 5890],
    ["58.90", 5890],
    ["1234", 123400],
    ["1.234", 123400],
    ["R$ 12,00", 1200],
    ["", 0],
    ["abc", 0],
  ])("lê %j como %i centavos", (input, cents) => {
    expect(parseBRL(input)).toBe(cents);
  });

  it("volta centavos pro formato do input", () => {
    expect(centsToInput(-5890)).toBe("58,90");
  });
});
