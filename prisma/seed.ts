// Conta de demonstração com os dados do protótipo, relativos ao dia de hoje.
// Uso: npm run db:seed  →  demo@spop.app / spop1234
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { DEFAULT_CATEGORIES } from "../lib/defaults";
import { addMonths, dateInMonth, fromISO, monthKey, todayISO } from "../lib/dates";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const EMAIL = "demo@spop.app";
const today = todayISO();
const month = monthKey(today);
const day = Number(today.slice(8, 10));

// Dia do protótipo (hoje = 24) → data real, sem passar de hoje.
function protoDate(protoDay: number) {
  return fromISO(dateInMonth(month, Math.max(1, day - (24 - protoDay))));
}

// [dia, descrição, categoria, valor em reais, conta, no cartão?]
const TX: [number, string, string, number, "nu" | "din", boolean][] = [
  [24, "iFood: pizza de sexta antecipada", "Comer fora", -58.9, "nu", true],
  [24, "Uber pro trabalho", "Transporte", -17.4, "nu", true],
  [23, "Pix do João (racha do churrasco)", "Pix recebido", 45, "nu", false],
  [23, "Mercado Dia", "Mercado", -134.72, "nu", true],
  [22, "Farmácia", "Saúde", -38.5, "nu", false],
  [21, "Steam: tava em promoção, juro", "Lazer", -49.99, "nu", true],
  [20, "Freela: logo pra padaria", "Freela", 450, "nu", false],
  [19, "Cinema", "Lazer", -64, "nu", true],
  [18, "Recarga do bilhete único", "Transporte", -50, "din", false],
  [15, "Mercado Assaí", "Mercado", -287.3, "nu", true],
  [12, "Conta de luz", "Moradia", -128.4, "nu", false],
  [10, "Netflix", "Assinaturas", -44.9, "nu", true],
  [8, "iFood: sushi (merecido)", "Comer fora", -92, "nu", true],
  [5, "Aluguel", "Moradia", -1400, "nu", false],
  [5, "Salário", "Salário", 4200, "nu", false],
  [3, "Bar com a galera", "Lazer", -110, "din", false],
  [2, "Mercado Dia", "Mercado", -96.15, "nu", false],
];

// Meses anteriores pro relatório: [entrou, saiu] em reais, do mais antigo pro mais recente.
const HISTORY: [number, number][] = [
  [3900, 3650],
  [4100, 3980],
  [5600, 5200],
  [4200, 4480],
  [4200, 3700],
  [4350, 3900],
  [4200, 3820],
  [4600, 4100],
  [4200, 4390],
  [4200, 4610],
  [4450, 3870],
];
const HISTORY_SPLIT: [string, string, number][] = [
  ["Aluguel", "Moradia", 0.36],
  ["Mercado", "Mercado", 0.2],
  ["iFood", "Comer fora", 0.08],
  ["Uber e ônibus", "Transporte", 0.07],
  ["Rolês", "Lazer", 0.12],
  ["Assinaturas", "Assinaturas", 0.03],
  ["Farmácia", "Saúde", 0.04],
  ["Contas da casa", "Moradia", 0.07],
  ["Outros", "Outros", 0.03],
];

const cents = (reais: number) => Math.round(reais * 100);

async function main() {
  await db.user.deleteMany({ where: { email: EMAIL } });
  const user = await db.user.create({
    data: {
      name: "Pedro",
      email: EMAIL,
      passwordHash: await bcrypt.hash("spop1234", 10),
      salaryDay: 5,
      categories: { create: DEFAULT_CATEGORIES.map((c) => ({ ...c })) },
    },
    include: { categories: true },
  });
  const userId = user.id;
  const cat = (name: string) => user.categories.find((c) => c.name === name)!.id;

  const monthTx = TX.map(([d, description, category, value, acc, card]) => ({
    d,
    description,
    category,
    value,
    acc,
    card,
  }));
  const sum = (acc: string) =>
    monthTx.filter((t) => t.acc === acc).reduce((a, t) => a + cents(t.value), 0);
  const history = HISTORY.flatMap(([inc, out], i) => {
    const m = addMonths(month, i - HISTORY.length);
    return [
      { m, description: "Salário", category: "Salário", value: cents(inc) },
      ...HISTORY_SPLIT.map(([description, category, share]) => ({
        m,
        description,
        category,
        value: -cents(out * share),
      })),
    ];
  });
  const historyTotal = history.reduce((a, t) => a + t.value, 0);

  const nu = await db.account.create({
    data: {
      userId,
      name: "Nubank",
      color: "#9184d9",
      initialBalanceCents: 128437 - sum("nu") - historyTotal,
    },
  });
  const din = await db.account.create({
    data: { userId, name: "Dinheiro", color: "#9397ab", initialBalanceCents: 6200 - sum("din") },
  });
  await db.account.create({ data: { userId, name: "Inter", color: "#e0a458", active: false } });

  const card = await db.creditCard.create({
    data: {
      userId,
      accountId: nu.id,
      name: "Nubank",
      last4: "4821",
      limitCents: 400000,
      closingDay: 3,
      dueDay: 10,
    },
  });

  await db.transaction.createMany({
    data: [
      ...monthTx.map((t) => ({
        userId,
        accountId: t.acc === "nu" ? nu.id : din.id,
        categoryId: cat(t.category),
        amountCents: cents(t.value),
        description: t.description,
        date: protoDate(t.d),
        cardId: t.card ? card.id : null,
      })),
      ...history.map((t) => ({
        userId,
        accountId: nu.id,
        categoryId: cat(t.category),
        amountCents: t.value,
        description: t.description,
        date: fromISO(dateInMonth(t.m, t.category === "Salário" ? 5 : 12)),
      })),
    ],
  });

  const bills = [
    ["Aluguel", "house-line", 1400, 5, true],
    ["Luz", "lightning", 128.4, 12, true],
    ["Internet", "wifi-high", 99.9, 26, false],
    ["Spotify", "music-notes", 21.9, 27, false],
    ["Academia (que eu vou, juro)", "barbell", 89.9, 30, false],
    ["Celular", "device-mobile", 55, 28, false],
  ] as const;
  for (const [name, icon, value, dueDay, paid] of bills) {
    await db.bill.create({
      data: {
        userId,
        name,
        icon,
        amountCents: cents(value),
        dueDay,
        payments: paid ? { create: { month } } : undefined,
      },
    });
  }

  await db.debt.createMany({
    data: [
      {
        userId,
        name: "Notebook",
        subtitle: "Cartão Nubank · sem juros",
        icon: "laptop",
        installmentCents: 38900,
        totalInstallments: 10,
        paidInstallments: 7,
        cardId: card.id,
        accountId: nu.id,
        categoryId: cat("Outros"),
      },
      {
        userId,
        name: "Empréstimo pessoal",
        subtitle: "Nubank · 2,1% a.m.",
        icon: "bank",
        installmentCents: 31840,
        totalInstallments: 12,
        paidInstallments: 5,
        accountId: nu.id,
        categoryId: cat("Outros"),
      },
      {
        userId,
        name: "Empréstimo da mãe",
        subtitle: "Sem juros, com culpa",
        icon: "heart",
        installmentCents: 10000,
        totalInstallments: 6,
        paidInstallments: 2,
      },
    ],
  });

  await db.goal.createMany({
    data: [
      {
        userId,
        name: "Reserva de emergência",
        icon: "umbrella",
        targetCents: 1000000,
        currentCents: 320000,
      },
      {
        userId,
        name: "Viagem pra praia",
        icon: "sun-horizon",
        targetCents: 150000,
        currentCents: 112000,
      },
      {
        userId,
        name: "Notebook novo",
        icon: "desktop-tower",
        targetCents: 450000,
        currentCents: 40000,
      },
    ],
  });

  await db.investment.createMany({
    data: [
      {
        userId,
        name: "Caixinha Nubank",
        subtitle: "100% do CDI · resgate na hora",
        amountCents: 320000,
        baseCents: 315180,
        baseMonth: month,
      },
      {
        userId,
        name: "Tesouro Selic 2029",
        subtitle: "Tesouro Direto",
        amountCents: 185000,
        baseCents: 185000,
        baseMonth: month,
      },
      {
        userId,
        name: "FIIs",
        subtitle: "3 fundos imobiliários",
        amountCents: 64000,
        baseCents: 64000,
        baseMonth: month,
      },
    ],
  });

  console.log(`Conta demo pronta: ${EMAIL} / spop1234`);
}

main().finally(() => db.$disconnect());
