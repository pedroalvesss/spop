import { formatBRL } from "@/lib/money";

interface GoalLike {
  targetCents: number;
  currentCents: number;
}

const COFFEE_CENTS = 700;

export function goalProgress(goal: GoalLike) {
  const ratio = goal.targetCents > 0 ? Math.min(1, goal.currentCents / goal.targetCents) : 0;
  return { ratio, pct: `${Math.round(ratio * 100)}%` };
}

// "Faltam R$ 380,00, ou uns 55 cafés" (café a R$ 7).
export function goalLine(goal: GoalLike) {
  const left = Math.max(0, goal.targetCents - goal.currentCents);
  if (left === 0) return "Meta batida. Pode comemorar (com moderação).";
  return `Faltam ${formatBRL(left)}, ou uns ${Math.ceil(left / COFFEE_CENTS)} cafés`;
}

export const GOAL_SHORTCUTS = [2000, 5000, 10000, 20000];
