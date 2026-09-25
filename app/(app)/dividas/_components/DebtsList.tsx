"use client";

import { useState } from "react";
import { AddCard } from "@/components/AddCard";
import type { DebtDto } from "@/services/dividasService/getDebts";
import { DebtCard } from "./DebtCard";
import { DebtForm } from "./DebtForm";

interface DebtsListProps {
  debts: DebtDto[];
  currentMonth: string;
  accounts: { id: string; name: string }[];
}

export function DebtsList({ debts, currentMonth, accounts }: DebtsListProps) {
  const [editor, setEditor] = useState({ open: false, debt: null as DebtDto | null, key: 0 });

  function handleEditCard(debt: DebtDto) {
    setEditor((e) => ({ open: true, debt, key: e.key + 1 }));
  }

  function handleClickAddCard() {
    setEditor((e) => ({ open: true, debt: null, key: e.key + 1 }));
  }

  function handleOpenChange(open: boolean) {
    setEditor((e) => ({ ...e, open }));
  }

  return (
    <>
      {debts.map((debt) => (
        <DebtCard key={debt.id} debt={debt} currentMonth={currentMonth} onEdit={handleEditCard} />
      ))}
      <AddCard label="Nova dívida" onClick={handleClickAddCard} />
      <DebtForm
        key={editor.key}
        debt={editor.debt}
        open={editor.open}
        accounts={accounts}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}
