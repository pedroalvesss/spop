// Dados criados no cadastro. Depois, tudo é editável em Ajustes.
export const DEFAULT_CATEGORIES = [
  {
    name: "Mercado",
    icon: "shopping-cart",
    type: "expense",
    monthlyBudgetCents: 60000,
  },
  {
    name: "Comer fora",
    icon: "hamburger",
    type: "expense",
    monthlyBudgetCents: 15000,
  },
  {
    name: "Transporte",
    icon: "bus",
    type: "expense",
    monthlyBudgetCents: 20000,
  },
  {
    name: "Lazer",
    icon: "game-controller",
    type: "expense",
    monthlyBudgetCents: 20000,
  },
  {
    name: "Moradia",
    icon: "house-line",
    type: "expense",
    monthlyBudgetCents: 160000,
  },
  {
    name: "Assinaturas",
    icon: "television-simple",
    type: "expense",
    monthlyBudgetCents: 9000,
  },
  {
    name: "Saúde",
    icon: "first-aid-kit",
    type: "expense",
    monthlyBudgetCents: 15000,
  },
  {
    name: "Outros",
    icon: "dots-three-outline",
    type: "expense",
    monthlyBudgetCents: 10000,
  },
  {
    name: "Salário",
    icon: "briefcase",
    type: "income",
    monthlyBudgetCents: null,
  },
  { name: "Freela", icon: "laptop", type: "income", monthlyBudgetCents: null },
  {
    name: "Pix recebido",
    icon: "arrow-down-left",
    type: "income",
    monthlyBudgetCents: null,
  },
  {
    name: "Rendimento",
    icon: "trend-up",
    type: "income",
    monthlyBudgetCents: null,
  },
] as const;

export const DEFAULT_ACCOUNT = { name: "Dinheiro", color: "#9397ab" } as const;
