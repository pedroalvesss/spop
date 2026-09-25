import { z } from "zod";
import { money, name } from "@/lib/schemas/common";

const count = z.coerce.number({ error: "Número inválido." }).int("Número inválido.");

export const debtSchema = z
  .object({
    name: name("Dá um nome pra dívida."),
    subtitle: z.string().trim().max(60),
    icon: z.string().min(1),
    installment: money,
    totalInstallments: count.min(1, "Pelo menos 1 parcela.").max(480),
    paidInstallments: count.min(0, "Não dá pra ter pago menos que zero."),
    accountId: z.string(),
  })
  .refine((d) => d.paidInstallments <= d.totalInstallments, {
    message: "Pagou mais parcelas do que existem? Confere aí.",
    path: ["paidInstallments"],
  });

export type DebtInput = z.input<typeof debtSchema>;
