"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postGoalMove } from "@/actions/metasActions/postGoalMove";
import { FormSheet } from "@/components/FormSheet";
import { MoneyField } from "@/components/MoneyField";
import { useToast } from "@/components/Toast";
import { useFormError } from "@/hooks/useFormError";
import { GOAL_SHORTCUTS } from "@/lib/goals";
import { centsToInput, formatBRL, parseBRL } from "@/lib/money";
import { goalMoveSchema, type GoalMoveInput } from "@/lib/schemas/goal";
import type { GoalDto } from "@/services/metasService/getGoals";

interface ShortcutButtonProps {
  cents: number;
  onPick: (cents: number) => void;
}

function ShortcutButton({ cents, onPick }: ShortcutButtonProps) {
  function handleClickShortcutButton() {
    onPick(cents);
  }
  return (
    <button
      type="button"
      onClick={handleClickShortcutButton}
      className="flex-1 rounded-lg bg-bg px-2 py-2 text-[13px] text-neutral-300 active:bg-accent-900"
    >
      {formatBRL(cents).replace(",00", "")}
    </button>
  );
}

interface GoalMoveSheetProps {
  goal: GoalDto | null;
  direction: "in" | "out";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalMoveSheet({ goal, direction, open, onOpenChange }: GoalMoveSheetProps) {
  const toast = useToast();
  const form = useForm<GoalMoveInput>({
    resolver: zodResolver(goalMoveSchema),
    defaultValues: { direction, amount: "50,00" },
  });
  const { error } = useFormError(form, ["amount"]);
  const isDeposit = direction === "in";

  function handlePickShortcut(cents: number) {
    form.setValue("amount", centsToInput(cents));
  }

  async function handleSubmitForm(data: GoalMoveInput) {
    if (!goal) return;
    await postGoalMove(goal.id, data);
    const value = formatBRL(parseBRL(data.amount));
    toast(
      isDeposit ? `+${value} em ${goal.name}. Orgulho.` : `Resgatou ${value}. Sem julgamentos.`,
    );
    onOpenChange(false);
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isDeposit ? `Guardar em ${goal?.name ?? ""}` : `Resgatar de ${goal?.name ?? ""}`}
      submitLabel={isDeposit ? "Guardar" : "Resgatar"}
      onSubmit={form.handleSubmit(handleSubmitForm)}
      saving={form.formState.isSubmitting}
      error={error}
    >
      <MoneyField id="goal-move-amount" label="Quanto" field={form.register("amount")} />
      <div className="flex gap-2">
        {GOAL_SHORTCUTS.map((cents) => (
          <ShortcutButton key={cents} cents={cents} onPick={handlePickShortcut} />
        ))}
      </div>
    </FormSheet>
  );
}
