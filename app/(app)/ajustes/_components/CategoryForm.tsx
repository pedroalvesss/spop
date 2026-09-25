"use client";

import { useController, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteCategoryById } from "@/actions/categoriasActions/deleteCategoryById";
import { postCategory } from "@/actions/categoriasActions/postCategory";
import { DeleteButton } from "@/components/DeleteButton";
import { FormSheet } from "@/components/FormSheet";
import { IconPicker } from "@/components/IconPicker";
import { MoneyField } from "@/components/MoneyField";
import { useToast } from "@/components/Toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Segmented } from "@/components/ui/segmented";
import { useFormError } from "@/hooks/useFormError";
import { centsToInput } from "@/lib/money";
import { categorySchema, type CategoryInput } from "@/lib/schemas/settings";

export interface EditableCategory {
  id: string;
  name: string;
  icon: string;
  type: "expense" | "income";
  monthlyBudgetCents: number | null;
}

const TYPE_OPTIONS = [
  { value: "expense" as const, label: "Saída" },
  { value: "income" as const, label: "Entrada", activeClassName: "text-income" },
];

interface CategoryFormProps {
  category: EditableCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryForm({ category, open, onOpenChange }: CategoryFormProps) {
  const toast = useToast();
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      icon: category?.icon ?? "star",
      type: category?.type ?? "expense",
      budget: category?.monthlyBudgetCents ? centsToInput(category.monthlyBudgetCents) : "",
    },
  });
  const { error, setServerError } = useFormError(form, ["name"]);
  const { field: iconField } = useController({ control: form.control, name: "icon" });
  const { field: typeField } = useController({ control: form.control, name: "type" });
  const type = useWatch({ control: form.control, name: "type" });

  async function handleSubmitForm(data: CategoryInput) {
    const result = await postCategory(data, category?.id);
    if (!result.ok) return setServerError(result.error);
    toast(category ? "Categoria atualizada." : "Categoria criada.");
    onOpenChange(false);
  }

  async function handleClickDeleteButton() {
    if (!category) return;
    await deleteCategoryById(category.id);
    toast(`${category.name} saiu das categorias. Os lançamentos antigos continuam lá.`);
    onOpenChange(false);
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={category ? "Editar categoria" : "Nova categoria"}
      submitLabel={category ? "Salvar alterações" : "Criar categoria"}
      onSubmit={form.handleSubmit(handleSubmitForm)}
      saving={form.formState.isSubmitting}
      error={error}
      footer={
        category && <DeleteButton label="Excluir categoria" onClick={handleClickDeleteButton} />
      }
    >
      {!category && (
        <Segmented
          label="Tipo da categoria"
          options={TYPE_OPTIONS}
          value={typeField.value}
          onChange={typeField.onChange}
          className="bg-bg"
          optionClassName="py-[9px] text-sm"
        />
      )}
      <div>
        <Label htmlFor="category-name">Nome</Label>
        <Input
          id="category-name"
          className="min-h-11 rounded-xl"
          placeholder="Ex.: Pet"
          {...form.register("name")}
        />
      </div>
      <IconPicker value={iconField.value} onChange={iconField.onChange} />
      {type === "expense" && (
        <MoneyField
          id="category-budget"
          label="Orçamento por mês (opcional)"
          field={form.register("budget")}
        />
      )}
    </FormSheet>
  );
}
