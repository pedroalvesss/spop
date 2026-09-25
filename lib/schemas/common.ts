import { z } from "zod";
import { parseBRL } from "@/lib/money";

export const ZERO_MESSAGE = "Coloca um valor. Zero reais não conta, infelizmente.";

// Valor obrigatório em reais ("1.234,56"), maior que zero.
export const money = z.string().refine((v) => parseBRL(v) > 0, ZERO_MESSAGE);

// Valor em reais que pode ficar vazio ou zerado (ex.: orçamento, saldo).
export const optionalMoney = z.string().max(20);

export const name = (message = "Faltou o nome.") => z.string().trim().min(1, message).max(60);

export const dayOfMonth = z.coerce
  .number({ error: "Dia inválido." })
  .int("Dia inválido.")
  .min(1, "O dia vai de 1 a 31.")
  .max(31, "O dia vai de 1 a 31.");

export const budgetSchema = z.object({ amount: optionalMoney });
export type BudgetInput = z.input<typeof budgetSchema>;
