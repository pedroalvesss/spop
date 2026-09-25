export interface TransactionOptions {
  accounts: { id: string; name: string }[];
  cards: { id: string; name: string }[];
  categories: { id: string; name: string; type: "expense" | "income" }[];
}

// O mínimo que o modal precisa pra editar um lançamento existente.
export interface EditableTransaction {
  id: string;
  amountCents: number;
  description: string;
  categoryId: string;
  accountId: string;
  cardId: string | null;
  date: string;
  fromInstallment: boolean;
}
