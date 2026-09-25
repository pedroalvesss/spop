import { describe, expect, it } from "vitest";
import {
  addMonths,
  dateInMonth,
  dayLabel,
  daysLeftInMonth,
  daysUntilDay,
  longDate,
  monthRange,
  monthShortYear,
  salaryLine,
  shortDate,
  todayISO,
  toISO,
} from "../dates";

describe("dates", () => {
  it("calcula o hoje no fuso de São Paulo", () => {
    // 02:00 UTC do dia 25 ainda é dia 24 em São Paulo.
    expect(todayISO(new Date("2026-09-25T02:00:00Z"))).toBe("2026-09-24");
  });

  it("anda meses e vira o ano", () => {
    expect(addMonths("2026-11", 2)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
  });

  it("monta o intervalo do mês pra consulta", () => {
    const { start, end } = monthRange("2026-09");
    expect(toISO(start)).toBe("2026-09-01");
    expect(toISO(end)).toBe("2026-10-01");
  });

  it("limita o dia ao tamanho do mês", () => {
    expect(dateInMonth("2026-02", 31)).toBe("2026-02-28");
  });

  it("rotula os dias como no extrato", () => {
    expect(dayLabel("2026-09-24", "2026-09-24")).toBe("Hoje");
    expect(dayLabel("2026-09-23", "2026-09-24")).toBe("Ontem");
    expect(dayLabel("2026-09-22", "2026-09-24")).toBe("ter, 22 set");
  });

  it("formata datas curtas e longas", () => {
    expect(shortDate("2026-10-03", true)).toBe("03 out");
    expect(shortDate("2026-10-03")).toBe("3 out");
    expect(longDate("2026-09-24")).toBe("Quinta, 24 de setembro");
    expect(monthShortYear("2026-12")).toBe("dez/2026");
  });

  it("conta os dias até o salário", () => {
    expect(daysUntilDay("2026-09-24", 30)).toBe(6);
    expect(daysUntilDay("2026-09-24", 5)).toBe(11);
    expect(daysUntilDay("2026-09-05", 5)).toBe(0);
    expect(salaryLine(6)).toBe("Faltam 6 dias pro salário");
    expect(salaryLine(1)).toBe("Falta 1 dia pro salário");
  });

  it("conta os dias que sobram no mês", () => {
    expect(daysLeftInMonth("2026-09-24")).toBe(6);
    expect(daysLeftInMonth("2026-09-30")).toBe(1);
  });
});
