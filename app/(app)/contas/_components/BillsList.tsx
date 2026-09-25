"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { BillView } from "@/lib/bills";
import { BillForm, type BillFormOptions } from "./BillForm";
import { BillRow } from "./BillRow";

interface BillsListProps {
  bills: BillView[];
  today: string;
  options: BillFormOptions;
}

export function BillsList({ bills, today, options }: BillsListProps) {
  const [editor, setEditor] = useState({ open: false, bill: null as BillView | null, key: 0 });

  function handleEditRow(bill: BillView) {
    setEditor((e) => ({ open: true, bill, key: e.key + 1 }));
  }

  function handleClickAddButton() {
    setEditor((e) => ({ open: true, bill: null, key: e.key + 1 }));
  }

  function handleOpenChange(open: boolean) {
    setEditor((e) => ({ ...e, open }));
  }

  return (
    <>
      {bills.length > 0 && (
        <Card className="gap-0 px-4 py-1">
          {bills.map((bill) => (
            <BillRow key={bill.id} bill={bill} today={today} onEdit={handleEditRow} />
          ))}
        </Card>
      )}
      <div className="px-1 text-xs text-neutral-500">
        Toque no círculo pra marcar como paga. A sensação é ótima, mas dura pouco.
      </div>
      <Button variant="secondary" className="min-h-11 rounded-xl" onClick={handleClickAddButton}>
        <Plus />
        Adicionar conta
      </Button>
      <BillForm
        key={editor.key}
        bill={editor.bill}
        open={editor.open}
        options={options}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}
