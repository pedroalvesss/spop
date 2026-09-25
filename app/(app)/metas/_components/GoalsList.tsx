"use client";

import { useState } from "react";
import { AddCard } from "@/components/AddCard";
import type { GoalDto } from "@/services/metasService/getGoals";
import { GoalCard } from "./GoalCard";
import { GoalForm } from "./GoalForm";
import { GoalMoveSheet } from "./GoalMoveSheet";

interface GoalsListProps {
  goals: GoalDto[];
}

type Sheet =
  | { kind: "none" }
  | { kind: "form"; goal: GoalDto | null }
  | { kind: "move"; goal: GoalDto; direction: "in" | "out" };

export function GoalsList({ goals }: GoalsListProps) {
  const [sheet, setSheet] = useState<Sheet>({ kind: "none" });
  const [key, setKey] = useState(0);

  function openSheet(next: Sheet) {
    setKey((k) => k + 1);
    setSheet(next);
  }

  function handleEditCard(goal: GoalDto) {
    openSheet({ kind: "form", goal });
  }

  function handleMoveCard(goal: GoalDto, direction: "in" | "out") {
    openSheet({ kind: "move", goal, direction });
  }

  function handleClickAddCard() {
    openSheet({ kind: "form", goal: null });
  }

  function handleOpenChange(open: boolean) {
    if (!open) setSheet({ kind: "none" });
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} onEdit={handleEditCard} onMove={handleMoveCard} />
      ))}
      <AddCard label="Nova caixinha" onClick={handleClickAddCard} />
      {sheet.kind === "form" && (
        <GoalForm key={key} goal={sheet.goal} open onOpenChange={handleOpenChange} />
      )}
      {sheet.kind === "move" && (
        <GoalMoveSheet
          key={key}
          goal={sheet.goal}
          direction={sheet.direction}
          open
          onOpenChange={handleOpenChange}
        />
      )}
    </div>
  );
}
