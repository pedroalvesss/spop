import { z } from "zod";
import { MODULE_IDS } from "@/lib/tabs";
import { dayOfMonth, name, optionalMoney } from "@/lib/schemas/common";

export const newAccountSchema = z.object({ name: name("Escreve o nome do banco ou carteira.") });
export type NewAccountInput = z.input<typeof newAccountSchema>;

export const accountSchema = z.object({
  name: name("Escreve o nome do banco ou carteira."),
  // Saldo de hoje; aceita negativo ("-120,00") pra conta no vermelho.
  balance: z.string().max(20),
});
export type AccountInput = z.input<typeof accountSchema>;

export const categorySchema = z.object({
  name: name("Dá um nome pra categoria."),
  icon: z.string().min(1),
  type: z.enum(["expense", "income"]),
  budget: optionalMoney,
});
export type CategoryInput = z.input<typeof categorySchema>;

export const preferencesSchema = z
  .object({
    hideValuesOnOpen: z.boolean(),
    billCreatesTransaction: z.boolean(),
    emailReminders: z.boolean(),
    salaryDay: dayOfMonth,
  })
  .partial();
export type PreferencesInput = z.input<typeof preferencesSchema>;

export const moduleSchema = z.object({ module: z.enum(MODULE_IDS), enabled: z.boolean() });
export type ModuleInput = z.input<typeof moduleSchema>;

export const bankConnectionSchema = z.object({
  itemId: z
    .string()
    .trim()
    .pipe(z.uuid("Esse Item ID não parece certo. Copia de novo no dashboard da Pluggy.")),
  accountId: z.string().min(1, "Escolhe a conta que recebe o extrato."),
  // Vazio = não importa o cartão.
  cardId: z.string(),
  since: z.iso.date("Data inválida."),
});
export type BankConnectionInput = z.input<typeof bankConnectionSchema>;

// Cores de conta nova: só tons da marca (verde e vermelho são dos números).
export const ACCOUNT_COLORS = ["#9184d9", "#9397ab", "#d2cefd", "#e0a458", "#796cbf", "#cfd3e5"];
