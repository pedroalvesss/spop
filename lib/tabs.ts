export const MODULE_IDS = [
  "tx",
  "budget",
  "bills",
  "cards",
  "debts",
  "goals",
  "invest",
  "reports",
] as const;
export type ModuleId = (typeof MODULE_IDS)[number];
export type TabId = "home" | ModuleId | "settings";

export interface Tab {
  id: TabId;
  href: string;
  name: string;
  short: string;
  icon: string;
  sub: string;
}

export const TABS: Tab[] = [
  { id: "home", href: "/", name: "Início", short: "Início", icon: "house", sub: "" },
  {
    id: "tx",
    href: "/transacoes",
    name: "Transações",
    short: "Extrato",
    icon: "arrows-down-up",
    sub: "Tudo que entrou e (principalmente) saiu",
  },
  {
    id: "budget",
    href: "/orcamento",
    name: "Orçamento",
    short: "Orçamento",
    icon: "chart-pie-slice",
    sub: "O que você prometeu gastar vs. o que gastou",
  },
  {
    id: "bills",
    href: "/contas",
    name: "Contas a pagar",
    short: "Contas",
    icon: "calendar-check",
    sub: "O que vence antes do próximo susto",
  },
  {
    id: "cards",
    href: "/cartoes",
    name: "Cartões",
    short: "Cartões",
    icon: "credit-card",
    sub: "O plástico que te conhece melhor que ninguém",
  },
  {
    id: "debts",
    href: "/dividas",
    name: "Dívidas",
    short: "Dívidas",
    icon: "hand-coins",
    sub: "Rumo à liberdade, uma parcela por vez",
  },
  {
    id: "goals",
    href: "/metas",
    name: "Metas",
    short: "Metas",
    icon: "piggy-bank",
    sub: "Dinheiro que (quase) não se mexe",
  },
  {
    id: "invest",
    href: "/investimentos",
    name: "Investimentos",
    short: "Investir",
    icon: "trend-up",
    sub: "Pouco, mas rendendo",
  },
  {
    id: "reports",
    href: "/relatorios",
    name: "Relatórios",
    short: "Relatórios",
    icon: "chart-bar",
    sub: "Gráficos pra entender pra onde foi",
  },
  {
    id: "settings",
    href: "/ajustes",
    name: "Ajustes",
    short: "Ajustes",
    icon: "gear-six",
    sub: "Deixa o app do seu jeito",
  },
];

// Início e Ajustes estão sempre ligados; o resto depende dos módulos da pessoa.
export function enabledTabs(modules: string[]) {
  return TABS.filter((t) => t.id === "home" || t.id === "settings" || modules.includes(t.id));
}

export function tabForPath(pathname: string) {
  return TABS.find((t) => t.href !== "/" && pathname.startsWith(t.href)) ?? TABS[0];
}

// Tab bar: Início, 1º módulo, +, 2º módulo, Mais. O resto (e Ajustes) vai pro "Mais".
export function bottomBar(modules: string[]) {
  const tabs = enabledTabs(modules);
  const mods = tabs.filter((t) => t.id !== "home" && t.id !== "settings");
  const [first, second] = mods;
  const inBar = new Set([first?.id, second?.id]);
  return {
    left: [TABS[0], ...(first ? [first] : [])],
    right: second ? [second] : [],
    more: tabs.filter((t) => t.id !== "home" && !inBar.has(t.id)),
  };
}
