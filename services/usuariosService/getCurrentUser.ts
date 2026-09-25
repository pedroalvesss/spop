import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";
import type { ModuleId } from "@/lib/tabs";

export interface CurrentUser {
  name: string;
  email: string;
  modules: string[];
  hideValuesOnOpen: boolean;
  salaryDay: number;
  billCreatesTransaction: boolean;
  emailReminders: boolean;
}

export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const user = await db.user.findUnique({
    where: { id: await getUserId() },
    select: {
      name: true,
      email: true,
      modules: true,
      hideValuesOnOpen: true,
      salaryDay: true,
      billCreatesTransaction: true,
      emailReminders: true,
    },
  });
  // Sessão de um usuário que não existe mais (banco resetado, conta apagada).
  if (!user) redirect("/sair");
  return user;
});

// Módulo desligado some da navegação e a rota volta pro Início.
export async function requireModule(id: ModuleId) {
  const { modules } = await getCurrentUser();
  if (!modules.includes(id)) redirect("/");
}
