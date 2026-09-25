"use client";

import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteGoalById } from "@/actions/metasActions/deleteGoalById";
import { postGoal } from "@/actions/metasActions/postGoal";
import { DeleteButton } from "@/components/DeleteButton";
import { FormSheet } from "@/components/FormSheet";
import { IconPicker } from "@/components/IconPicker";
import { MoneyField } from "@/components/MoneyField";
import { useToast } from "@/components/Toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormError } from "@/hooks/useFormError";
import { centsToInput } from "@/lib/money";
import { goalSchema, type GoalInput } from "@/lib/schemas/goal";
import type { GoalDto } from "@/services/metasService/getGoals";

interface GoalFormProps {
  goal: GoalDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalForm({ goal, open, onOpenChange }: GoalFormProps) {
  const toast = useToast();
  const form = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name ?? "",
      icon: goal?.icon ?? "star",
      target: goal ? centsToInput(goal.targetCents) : "",
      current: goal ? centsToInput(goal.currentCents) : "",
    },
  });
  const { error, setServerError } = useFormError(form, ["name", "target"]);
  const { field: iconField } = useController({ control: form.control, name: "icon" });

  async function handleSubmitForm(data: GoalInput) {
    const result = await postGoal(data, goal?.id);
    if (!result.ok) return setServerError(result.error);
    toast(
      goal
        ? "Caixinha atualizada."
        : "Caixinha criada. Agora é só colocar dinheiro (a parte difícil).",
    );
    onOpenChange(false);
  }

  async function handleClickDeleteButton() {
    if (!goal) return;
    await deleteGoalById(goal.id);
    toast(`${goal.name} foi desfeita.`);
    onOpenChange(false);
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={goal ? "Editar caixinha" : "Nova caixinha"}
      submitLabel={goal ? "Salvar alterações" : "Criar caixinha"}
      onSubmit={form.handleSubmit(handleSubmitForm)}
      saving={form.formState.isSubmitting}
      error={error}
      footer={goal && <DeleteButton label="Excluir caixinha" onClick={handleClickDeleteButton} />}
    >
      <div>
        <Label htmlFor="goal-name">Nome</Label>
        <Input
          id="goal-name"
          className="min-h-11 rounded-xl"
          placeholder="Ex.: Viagem pra praia"
          {...form.register("name")}
        />
      </div>
      <IconPicker value={iconField.value} onChange={iconField.onChange} />
      <div className="grid grid-cols-2 gap-2.5">
        <MoneyField id="goal-target" label="Meta" field={form.register("target")} />
        <MoneyField id="goal-current" label="Já tem" field={form.register("current")} />
      </div>
    </FormSheet>
  );
}
