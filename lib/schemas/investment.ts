import { z } from "zod";
import { name, optionalMoney } from "@/lib/schemas/common";

export const investmentSchema = z.object({
  name: name("Dá um nome pro investimento."),
  subtitle: z.string().trim().max(60),
  amount: optionalMoney,
});

export type InvestmentInput = z.input<typeof investmentSchema>;
