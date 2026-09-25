"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react/ssr";
import { Money } from "@/components/HideValues";
import { ListRow } from "@/components/ListRow";
import { Button } from "@/components/ui/button";
import { CategoryForm, type EditableCategory } from "./CategoryForm";
import { SettingsCard } from "./SettingsCard";

interface CategoryRowProps {
  category: EditableCategory;
  onEdit: (category: EditableCategory) => void;
}

function CategoryRow({ category, onEdit }: CategoryRowProps) {
  function handleClickRow() {
    onEdit(category);
  }

  let meta = "Entrada";
  if (category.type === "expense")
    meta = category.monthlyBudgetCents ? "Orçamento" : "Sem orçamento";

  return (
    <ListRow
      icon={category.icon}
      title={category.name}
      meta={meta}
      value={
        category.monthlyBudgetCents ? <Money cents={category.monthlyBudgetCents} /> : undefined
      }
      valueClassName="text-neutral-300"
      onClick={handleClickRow}
    />
  );
}

interface CategoriesCardProps {
  categories: EditableCategory[];
}

export function CategoriesCard({ categories }: CategoriesCardProps) {
  const [editor, setEditor] = useState({
    open: false,
    category: null as EditableCategory | null,
    key: 0,
  });

  function handleEditRow(category: EditableCategory) {
    setEditor((e) => ({ open: true, category, key: e.key + 1 }));
  }

  function handleClickAddButton() {
    setEditor((e) => ({ open: true, category: null, key: e.key + 1 }));
  }

  function handleOpenChange(open: boolean) {
    setEditor((e) => ({ ...e, open }));
  }

  return (
    <SettingsCard title="Categorias" description="Nome, ícone e quanto dá pra gastar em cada uma.">
      {categories.map((category) => (
        <CategoryRow key={category.id} category={category} onEdit={handleEditRow} />
      ))}
      <Button
        variant="secondary"
        className="mt-2 min-h-10 rounded-[10px]"
        onClick={handleClickAddButton}
      >
        <Plus />
        Nova categoria
      </Button>
      <CategoryForm
        key={editor.key}
        category={editor.category}
        open={editor.open}
        onOpenChange={handleOpenChange}
      />
    </SettingsCard>
  );
}
