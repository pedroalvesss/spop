import { z } from "zod";
import { parseBRL } from "@/lib/money";

export const CARD_PREFIX = "card:";

export const transactionSchema = z.object({
  type: z.enum(["out", "in"]),
  amount: z
    .string()
    .refine((v) => parseBRL(v) > 0, "Coloca um valor. Zero reais não conta, infelizmente."),
  description: z
    .string()
    .trim()
    .min(1, "Descreve o que foi. O Pedro do futuro vai querer saber.")
    .max(120),
  categoryId: z.string().min(1, "Escolhe uma categoria."),
  // Conta ou cartão ("card:<id>"): o select de conta também lista os cartões.
  source: z.string().min(1, "Escolhe uma conta."),
  date: z.iso.date("Data inválida."),
  installments: z.string().regex(/^([1-9]|1[0-2])$/),
});

export type TransactionInput = z.input<typeof transactionSchema>;

// Compra parcelada: cada parcela é o total dividido, arredondado pro centavo.
export function installmentCents(totalCents: number, installments: number) {
  return Math.round(totalCents / installments);
}
