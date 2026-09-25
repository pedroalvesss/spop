"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";
import { moduleSchema, type ModuleInput } from "@/lib/schemas/settings";
import { MODULE_IDS } from "@/lib/tabs";

// Liga/desliga uma aba. A ordem dos módulos segue sempre a do app (define a tab bar).
export async function putUserModule(input: ModuleInput) {
  const userId = await getUserId();
  const { module, enabled } = moduleSchema.parse(input);
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { modules: true },
  });
  const next = new Set(user.modules);
  if (enabled) next.add(module);
  else next.delete(module);
  await db.user.update({
    where: { id: userId },
    data: { modules: MODULE_IDS.filter((m) => next.has(m)) },
  });
  revalidatePath("/", "layout");
}
