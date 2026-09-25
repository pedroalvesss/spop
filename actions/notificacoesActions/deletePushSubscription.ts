"use server";

import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

export async function deletePushSubscription(endpoint: string) {
  const userId = await getUserId();
  await db.pushSubscription.deleteMany({ where: { endpoint, userId } });
}
