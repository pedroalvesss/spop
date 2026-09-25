"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

const subscriptionSchema = z.object({
  endpoint: z.url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

// Guarda a inscrição de push deste aparelho (um endpoint por aparelho/navegador).
export async function postPushSubscription(input: unknown) {
  const userId = await getUserId();
  const { endpoint, keys } = subscriptionSchema.parse(input);
  await db.pushSubscription.upsert({
    where: { endpoint },
    create: { userId, endpoint, ...keys },
    update: { userId, ...keys },
  });
}
