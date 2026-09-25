import type { Metadata } from "next";
import { getGoals } from "@/services/metasService/getGoals";
import { requireModule } from "@/services/usuariosService/getCurrentUser";
import { GoalsList } from "./_components/GoalsList";

export const metadata: Metadata = { title: "Metas · SPOP!" };

export default async function GoalsPage() {
  await requireModule("goals");
  return <GoalsList goals={await getGoals()} />;
}
