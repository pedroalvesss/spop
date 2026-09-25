import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";

export interface AccountOption {
  id: string;
  name: string;
}

export const getActiveAccounts = cache(async (): Promise<AccountOption[]> => {
  return db.account.findMany({
    where: { userId: await getUserId(), active: true },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });
});
