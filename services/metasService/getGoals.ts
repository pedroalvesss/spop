import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

export interface GoalDto {
  id: string;
  name: string;
  icon: string;
  targetCents: number;
  currentCents: number;
}

export const getGoals = cache(async (): Promise<GoalDto[]> => {
  return db.goal.findMany({
    where: { userId: await getUserId() },
    select: { id: true, name: true, icon: true, targetCents: true, currentCents: true },
    orderBy: { createdAt: "asc" },
  });
});
