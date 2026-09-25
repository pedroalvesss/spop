import { shortDate, TIMEZONE, todayISO } from "@/lib/dates";

// Campos de GET /v2/transactions da Pluggy que o SPOP usa.
export interface PluggyTransaction {
  id: string;
  description: string;
  amount: number;
  amountInAccountCurrency?: number | null;
  date: string;
  category?: string | null;
  creditCardMetadata?: { installmentNumber?: number; totalInstallments?: number } | null;
}

export type PluggyAccountType = "BANK" | "CREDIT";

export interface ImportedTransaction {
  externalId: string;
  description: string;
  amountCents: number;
  date: string;
  hint: string;
}

// Não é gasto nem ganho de verdade: pagar a fatura (as compras já contaram no cartão) e dinheiro
// indo e voltando das caixinhas.
// ponytail: lista de palavras; ajustar quando entrar algo que não devia.
const SKIP =
  /pagamento de fatura|pagamento recebido|credit card payment|aplica[cç][aã]o|resgate|\brdb\b|caixinha|same person/i;

export function toImported(
  t: PluggyTransaction,
  accountType: PluggyAccountType,
): ImportedTransaction | null {
  const amount = t.amountInAccountCurrency ?? t.amount;
  // No cartão a Pluggy usa positivo pra compra e negativo pra pagamento ou estorno.
  const cents = Math.round(amount * 100) * (accountType === "CREDIT" ? -1 : 1);
  // ponytail: estorno no cartão fica de fora; o SPOP não tem "entrada" em cartão.
  if (cents === 0 || (accountType === "CREDIT" && cents > 0)) return null;
  const hint = `${t.category ?? ""} ${t.description}`;
  if (SKIP.test(hint)) return null;

  const meta = t.creditCardMetadata;
  const installment =
    meta?.totalInstallments && meta.totalInstallments > 1
      ? ` (${meta.installmentNumber}/${meta.totalInstallments})`
      : "";
  return {
    externalId: t.id,
    description: `${t.description.trim()}${installment}`.slice(0, 120),
    amountCents: cents,
    // A Pluggy manda UTC; o dia que vale é o de São Paulo.
    date: todayISO(new Date(t.date)),
    hint,
  };
}

// Categoria da Pluggy (em inglês) ou nome do estabelecimento → categoria padrão do SPOP.
const CATEGORY_RULES: [RegExp, string][] = [
  [/groceries|supermarket|supermerc|carrefour|assa[ií]|atacad|hortifruti/i, "Mercado"],
  [/food|eating|restaurant|delivery|bakery|ifood|rappi|padaria|lanchonete/i, "Comer fora"],
  [/transport|taxi|ride|gas station|fuel|parking|toll|mobility|uber|\b99|posto/i, "Transporte"],
  [
    /streaming|subscription|digital service|netflix|spotify|prime video|disney|youtube/i,
    "Assinaturas",
  ],
  [/housing|\brent|utilit|electricity|water|condominium|telecom|aluguel|condom[ií]nio/i, "Moradia"],
  [/health|pharmac|hospital|clinic|dentist|farm[aá]cia|drogasil|drogaria|droga ?raia/i, "Saúde"],
  [/leisure|entertainment|games|cinema|ticket|sport|travel|steam|ingresso/i, "Lazer"],
  [/salary|payroll|wage|sal[aá]rio/i, "Salário"],
  [/interest|yield|dividend|rendimento/i, "Rendimento"],
];
const FALLBACK = { expense: "Outros", income: "Pix recebido" } as const;

export interface CategoryRef {
  id: string;
  name: string;
  type: "expense" | "income";
}

export function pickCategory(
  t: Pick<ImportedTransaction, "hint" | "amountCents">,
  categories: CategoryRef[],
) {
  const type = t.amountCents < 0 ? "expense" : "income";
  const ofType = categories.filter((c) => c.type === type);
  const byName = (name: string) => ofType.find((c) => c.name === name)?.id;
  const rule = CATEGORY_RULES.find(([re, name]) => re.test(t.hint) && byName(name));
  return (rule && byName(rule[1])) ?? byName(FALLBACK[type]) ?? ofType[0]?.id;
}

// "Atualizado hoje às 08:12" / "Atualizado em 24 set às 08:12", no horário de São Paulo.
export function syncedLabel(syncedAt: Date | null, now = new Date()) {
  if (!syncedAt) return "Ainda não sincronizou";
  const time = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(syncedAt);
  const day = todayISO(syncedAt);
  return day === todayISO(now)
    ? `Atualizado hoje às ${time}`
    : `Atualizado em ${shortDate(day)} às ${time}`;
}
