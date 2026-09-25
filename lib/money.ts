const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const HIDDEN_MONEY = "R$ ••••";

export function formatBRL(cents: number) {
  return BRL.format(cents / 100);
}

// "+ R$ 45,00" pra entrada e "− R$ 58,90" (U+2212) pra saída.
export function formatSigned(cents: number) {
  return `${cents >= 0 ? "+" : "−"} ${formatBRL(Math.abs(cents))}`;
}

// Saldo principal: os centavos vão em tom apagado.
export function splitCents(cents: number): [string, string] {
  const text = formatBRL(cents);
  const comma = text.lastIndexOf(",");
  return [text.slice(0, comma), text.slice(comma)];
}

// Aceita "1.234,56", "58,9", "58.90" e "1234". Devolve centavos (0 se não der pra ler).
export function parseBRL(input: string): number {
  const clean = input.replace(/[^\d.,]/g, "");
  if (!clean) return 0;
  let normalized: string;
  if (clean.includes(",")) {
    normalized = clean.replace(/\./g, "").replace(",", ".");
  } else {
    const parts = clean.split(".");
    const last = parts[parts.length - 1];
    normalized = parts.length === 2 && last.length <= 2 ? clean : clean.replace(/\./g, "");
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

// Pra preencher o input de valor ao editar: 5890 → "58,90".
export function centsToInput(cents: number) {
  return (Math.abs(cents) / 100).toFixed(2).replace(".", ",");
}
