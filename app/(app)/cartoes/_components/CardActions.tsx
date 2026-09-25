"use client";

import { useState } from "react";
import { PencilSimple, Plus } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { CardForm, type EditableCard } from "./CardForm";

interface CardActionsProps {
  card: EditableCard | null;
  accounts: { id: string; name: string }[];
}

// Botões de adicionar e editar cartão, com o formulário que eles abrem.
export function CardActions({ card, accounts }: CardActionsProps) {
  const [editor, setEditor] = useState({ open: false, card: null as EditableCard | null, key: 0 });

  function handleClickAddButton() {
    setEditor((e) => ({ open: true, card: null, key: e.key + 1 }));
  }

  function handleClickEditButton() {
    setEditor((e) => ({ open: true, card, key: e.key + 1 }));
  }

  function handleOpenChange(open: boolean) {
    setEditor((e) => ({ ...e, open }));
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        className="min-h-11 flex-1 rounded-xl"
        onClick={handleClickAddButton}
      >
        <Plus />
        Adicionar cartão
      </Button>
      {card && (
        <Button
          variant="secondary"
          className="min-h-11 rounded-xl"
          aria-label="Editar cartão"
          onClick={handleClickEditButton}
        >
          <PencilSimple />
        </Button>
      )}
      <CardForm
        key={editor.key}
        card={editor.card}
        open={editor.open}
        accounts={accounts}
        onOpenChange={handleOpenChange}
      />
    </div>
  );
}
