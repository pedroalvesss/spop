"use client";

import { Plus } from "@phosphor-icons/react/ssr";
import { Money, Private } from "@/components/HideValues";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { goalLine, goalProgress } from "@/lib/goals";
import type { GoalDto } from "@/services/metasService/getGoals";

interface GoalCardProps {
  goal: GoalDto;
  onEdit: (goal: GoalDto) => void;
  onMove: (goal: GoalDto, direction: "in" | "out") => void;
}

export function GoalCard({ goal, onEdit, onMove }: GoalCardProps) {
  const { ratio, pct } = goalProgress(goal);
  const done = goal.currentCents >= goal.targetCents;

  function handleClickGoalButton() {
    onEdit(goal);
  }

  function handleClickSaveButton() {
    onMove(goal, "in");
  }

  function handleClickWithdrawButton() {
    onMove(goal, "out");
  }

  return (
    <Card className="gap-3.5 p-[18px]">
      <button
        type="button"
        onClick={handleClickGoalButton}
        className="flex items-center gap-2.5 text-left"
      >
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-900 text-xl text-accent-300">
          <Icon name={goal.icon} />
        </div>
        <span className="flex-1 text-[15px]">{goal.name}</span>
        <span className="text-[13px] text-neutral-400">{pct}</span>
      </button>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[26px] font-medium tracking-[-0.02em] tabular-nums">
          <Money cents={goal.currentCents} />
        </span>
        <span className="text-[13px] text-neutral-500">
          de <Money cents={goal.targetCents} />
        </span>
      </div>
      <ProgressBar ratio={ratio} />
      <div className="text-xs text-neutral-400">
        {done ? goalLine(goal) : <Private fallback="Faltam ••••">{goalLine(goal)}</Private>}
      </div>
      <div className="flex gap-2">
        <Button className="min-h-10 flex-1 rounded-[10px]" onClick={handleClickSaveButton}>
          <Plus />
          Guardar
        </Button>
        <Button
          variant="secondary"
          className="min-h-10 rounded-[10px]"
          onClick={handleClickWithdrawButton}
        >
          Resgatar
        </Button>
      </div>
    </Card>
  );
}
