import { z } from "zod";
import { money, name, optionalMoney } from "@/lib/schemas/common";

export const goalSchema = z.object({
  name: name("Dá um nome pra caixinha."),
  icon: z.string().min(1),
  target: money,
  current: optionalMoney,
});

export type GoalInput = z.input<typeof goalSchema>;

export const goalMoveSchema = z.object({
  direction: z.enum(["in", "out"]),
  amount: money,
});

export type GoalMoveInput = z.input<typeof goalMoveSchema>;
