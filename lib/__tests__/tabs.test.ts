import { describe, expect, it } from "vitest";
import { bottomBar, enabledTabs, MODULE_IDS, tabForPath } from "../tabs";

const ids = (tabs: { id: string }[]) => tabs.map((t) => t.id);

describe("tabs", () => {
  it("Início e Ajustes ficam sempre ligados", () => {
    expect(ids(enabledTabs([]))).toEqual(["home", "settings"]);
  });

  it("monta a tab bar com os dois primeiros módulos ativos", () => {
    const bar = bottomBar([...MODULE_IDS]);
    expect(ids(bar.left)).toEqual(["home", "tx"]);
    expect(ids(bar.right)).toEqual(["budget"]);
    expect(ids(bar.more)).toEqual([
      "bills",
      "cards",
      "debts",
      "goals",
      "invest",
      "reports",
      "settings",
    ]);
  });

  it("puxa o próximo módulo quando um é desligado", () => {
    const bar = bottomBar(["budget", "goals", "reports"]);
    expect(ids(bar.left)).toEqual(["home", "budget"]);
    expect(ids(bar.right)).toEqual(["goals"]);
    expect(ids(bar.more)).toEqual(["reports", "settings"]);
  });

  it("acha a aba pela rota", () => {
    expect(tabForPath("/").id).toBe("home");
    expect(tabForPath("/transacoes").id).toBe("tx");
    expect(tabForPath("/ajustes").id).toBe("settings");
  });
});
