import { afterEach, describe, expect, it, vi } from "vitest";
import { getPluggyTransactions } from "../getPluggyTransactions";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

afterEach(() => vi.unstubAllGlobals());

describe("getPluggyTransactions", () => {
  it("autentica uma vez e segue o cursor até acabar", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(json({ apiKey: "k" }))
      .mockResolvedValueOnce(json({ results: [{ id: "a" }], next: "?accountId=acc&after=X" }))
      .mockResolvedValueOnce(json({ results: [{ id: "b" }], next: null }));
    vi.stubGlobal("fetch", fetch);

    const txs = await getPluggyTransactions("acc", "2026-09-01");

    expect(txs.map((t) => t.id)).toEqual(["a", "b"]);
    expect(fetch.mock.calls[1][0]).toBe(
      "https://api.pluggy.ai/v2/transactions?accountId=acc&dateFrom=2026-09-01",
    );
    expect(fetch.mock.calls[1][1].headers).toEqual({ "X-API-KEY": "k" });
    expect(fetch.mock.calls[2][0]).toBe(
      "https://api.pluggy.ai/v2/transactions?accountId=acc&after=X",
    );
  });

  it("erro da API sobe", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 500)));
    await expect(getPluggyTransactions("acc", "2026-09-01")).rejects.toThrow("500");
  });
});
