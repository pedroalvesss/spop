import { z } from "zod";
import { dayOfMonth, money, name } from "@/lib/schemas/common";

export const cardSchema = z.object({
  name: name("Dá um nome pro cartão."),
  last4: z.string().regex(/^\d{4}$/, "Os 4 últimos números, só dígitos."),
  limit: money,
  closingDay: dayOfMonth,
  dueDay: dayOfMonth,
  accountId: z.string().min(1, "Escolhe o banco do cartão."),
});

export type CardInput = z.input<typeof cardSchema>;
