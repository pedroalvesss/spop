import { z } from "zod";
import { dayOfMonth, money, name } from "@/lib/schemas/common";

export const billSchema = z.object({
  name: name("Dá um nome pra conta."),
  icon: z.string().min(1),
  amount: money,
  dueDay: dayOfMonth,
  categoryId: z.string(),
  accountId: z.string(),
});

export type BillInput = z.input<typeof billSchema>;
