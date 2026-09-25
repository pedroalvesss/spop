import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

export interface CardOption {
  id: string;
  name: string;
}

export const getActiveCards = cache(async (): Promise<CardOption[]> => {
  return db.creditCard.findMany({
    where: { userId: await getUserId(), active: true },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });
});
