"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { putCategoryBudget } from "@/actions/categoriasActions/putCategoryBudget";
import { FormSheet } from "@/components/FormSheet";
import { MoneyField } from "@/components/MoneyField";
import { useToast } from "@/components/Toast";
import type { BudgetRow } from "@/lib/budget";
import { centsToInput } from "@/lib/money";
import { budgetSchema, type BudgetInput } from "@/lib/schemas/common";
import { BudgetCategoryCard } from "./BudgetCategoryCard";

interface BudgetListProps {
  rows: BudgetRow[];
}

// Tocar numa categoria abre o orçamento dela pra editar.
export function BudgetList({ rows }: BudgetListProps) {
  const toast = useToast();
  const [editing, setEditing] = useState<BudgetRow | null>(null);
  const form = useForm<BudgetInput>({ resolver: zodResolver(budgetSchema) });

  function handleEditCard(row: BudgetRow) {
    form.reset({ amount: centsToInput(row.budgetCents) });
    setEditing(row);
  }

  function handleOpenChange(open: boolean) {
    if (!open) setEditing(null);
  }

  async function handleSubmitForm(data: BudgetInput) {
    if (!editing) return;
    await putCategoryBudget(editing.id, data);
    toast(`Orçamento de ${editing.name} atualizado. Agora é cumprir.`);
    setEditing(null);
  }

  return (
    <>
      {rows.map((row) => (
        <BudgetCategoryCard key={row.id} row={row} onEdit={handleEditCard} />
      ))}
      <FormSheet
        open={editing !== null}
        onOpenChange={handleOpenChange}
        title={editing ? `Orçamento: ${editing.name}` : "Orçamento"}
        submitLabel="Salvar orçamento"
        onSubmit={form.handleSubmit(handleSubmitForm)}
        saving={form.formState.isSubmitting}
      >
        <MoneyField
          id="budget-amount"
          label="Quanto dá pra gastar por mês"
          field={form.register("amount")}
        />
        <p className="text-xs text-neutral-500">Deixe zerado pra tirar a categoria do orçamento.</p>
      </FormSheet>
    </>
  );
}
