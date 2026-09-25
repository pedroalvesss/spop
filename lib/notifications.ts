import { formatBRL } from "@/lib/money";
import { billStatus, type BillView } from "@/lib/bills";
import type { PushPayload } from "@/lib/push";

// Avisa só quando o gasto cruza a linha (85% ou 100%), não a cada lançamento depois dela.
export function budgetAlert(
  name: string,
  budgetCents: number,
  beforeCents: number,
  afterCents: number,
): PushPayload | null {
  const before = beforeCents / budgetCents;
  const after = afterCents / budgetCents;
  if (before <= 1 && after > 1) {
    return {
      title: `${name} estourou em ${formatBRL(afterCents - budgetCents)}`,
      body: "A gente finge que não viu. Mas só dessa vez.",
      url: "/orcamento",
      tag: `budget-${name}`,
    };
  }
  if (before < 0.85 && after >= 0.85 && after <= 1) {
    return {
      title: `${name} já foi ${Math.round(after * 100)}%`,
      body: "Segura a onda até o dia 30.",
      url: "/orcamento",
      tag: `budget-${name}`,
    };
  }
  return null;
}

// Lembrete de contas que vencem hoje ou amanhã e ainda não foram pagas.
export function dueBills<T extends Pick<BillView, "paid" | "dueDate">>(bills: T[], today: string) {
  return bills.filter((b) => {
    const { text } = billStatus(b, today);
    return text === "Vence hoje" || text === "Vence amanhã";
  });
}

export function billPush(
  bill: Pick<BillView, "name" | "amountCents" | "paid" | "dueDate">,
  today: string,
): PushPayload {
  const { text } = billStatus(bill, today);
  return {
    title: `${bill.name}: ${text.toLowerCase()}`,
    body: `${formatBRL(bill.amountCents)}. Toca pra marcar como paga.`,
    url: "/contas",
    tag: `bill-${bill.name}`,
  };
}
