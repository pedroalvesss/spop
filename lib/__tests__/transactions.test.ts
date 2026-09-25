import { describe, expect, it } from "vitest";
import { countLabel, groupByDay, parseTransactionParams, transactionsHref } from "../transactions";

describe("parâmetros da tela de transações", () => {
  it("usa padrões seguros pra lixo na URL", () => {
    expect(parseTransactionParams({ mes: "2026-13", tipo: "x", limite: "-1" }, "2026-09")).toEqual({
      month: "2026-09",
      filter: "all",
      search: "",
      limit: 50,
    });
  });

  it("lê os filtros e monta o link de volta", () => {
    const params = parseTransactionParams({ mes: "2026-08", tipo: "out", q: " ifood " }, "2026-09");
    expect(params).toMatchObject({ month: "2026-08", filter: "out", search: "ifood" });
    expect(transactionsHref(params, { limit: 100 })).toBe(
      "/transacoes?mes=2026-08&tipo=out&q=ifood&limite=100",
    );
    expect(transactionsHref(params, { filter: "all", search: "" })).toBe("/transacoes?mes=2026-08");
  });
});

describe("groupByDay", () => {
  it("agrupa por dia e soma o total", () => {
    const groups = groupByDay(
      [
        { date: "2026-09-24", amountCents: -5890 },
        { date: "2026-09-24", amountCents: -1740 },
        { date: "2026-09-23", amountCents: 4500 },
        { date: "2026-09-22", amountCents: -3850 },
      ],
      "2026-09-24",
    );
    expect(groups.map((g) => [g.label, g.totalCents, g.items.length])).toEqual([
      ["Hoje", -7630, 2],
      ["Ontem", 4500, 1],
      ["ter, 22 set", -3850, 1],
    ]);
  });
});

describe("countLabel", () => {
  it("concorda no plural", () => {
    expect(countLabel(1)).toBe("1 lançamento");
    expect(countLabel(17)).toBe("17 lançamentos");
  });
});
