import { describe, expect, it } from "vitest";
import { pickCategory, toImported, type PluggyTransaction } from "../bankImport";

const tx = (over: Partial<PluggyTransaction>): PluggyTransaction => ({
  id: "p1",
  description: "Pix enviado",
  amount: -12.5,
  date: "2026-09-25T02:00:00.000Z",
  ...over,
});

const categories = [
  { id: "mercado", name: "Mercado", type: "expense" as const },
  { id: "comer", name: "Comer fora", type: "expense" as const },
  { id: "outros", name: "Outros", type: "expense" as const },
  { id: "salario", name: "Salário", type: "income" as const },
  { id: "pix", name: "Pix recebido", type: "income" as const },
];

describe("toImported", () => {
  it("conta corrente mantém o sinal e usa o dia de São Paulo", () => {
    expect(toImported(tx({}), "BANK")).toMatchObject({
      externalId: "p1",
      amountCents: -1250,
      date: "2026-09-24",
    });
  });

  it("compra no cartão vira saída e ganha o número da parcela", () => {
    const t = tx({
      description: "Loja",
      amount: 100,
      creditCardMetadata: { installmentNumber: 2, totalInstallments: 5 },
    });
    expect(toImported(t, "CREDIT")).toMatchObject({
      amountCents: -10000,
      description: "Loja (2/5)",
    });
  });

  it("usa o valor em reais de compra internacional", () => {
    const t = tx({ amount: 10, amountInAccountCurrency: 55.3 });
    expect(toImported(t, "CREDIT")?.amountCents).toBe(-5530);
  });

  it("ignora pagamento de fatura, caixinha e estorno no cartão", () => {
    expect(toImported(tx({ description: "Pagamento de fatura" }), "BANK")).toBeNull();
    expect(toImported(tx({ description: "Aplicação RDB" }), "BANK")).toBeNull();
    expect(toImported(tx({ amount: -30 }), "CREDIT")).toBeNull();
    expect(toImported(tx({ amount: 0 }), "BANK")).toBeNull();
  });
});

describe("pickCategory", () => {
  it("acha pela categoria da Pluggy ou pelo nome do estabelecimento", () => {
    expect(pickCategory({ hint: "Groceries Mercadinho", amountCents: -1 }, categories)).toBe(
      "mercado",
    );
    expect(pickCategory({ hint: " IFOOD *IFOOD", amountCents: -1 }, categories)).toBe("comer");
    expect(pickCategory({ hint: "Salary Empresa", amountCents: 1 }, categories)).toBe("salario");
  });

  it("cai em Outros ou Pix recebido quando não reconhece", () => {
    expect(pickCategory({ hint: "Fulano", amountCents: -1 }, categories)).toBe("outros");
    expect(pickCategory({ hint: "Fulano", amountCents: 1 }, categories)).toBe("pix");
  });

  it("só usa regra cuja categoria existe no tipo certo", () => {
    expect(pickCategory({ hint: "Salary", amountCents: -1 }, categories)).toBe("outros");
  });
});
