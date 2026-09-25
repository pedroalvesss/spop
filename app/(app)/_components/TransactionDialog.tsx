"use client";

import { useWatch } from "react-hook-form";
import { DeleteButton } from "@/components/DeleteButton";
import { FormSheet } from "@/components/FormSheet";
import { Segmented } from "@/components/ui/segmented";
import { useTransactionForm } from "../_hooks/useTransactionForm";
import { AmountField } from "./AmountField";
import { TransactionFields } from "./TransactionFields";
import type { EditableTransaction, TransactionOptions } from "./transactionTypes";

const TYPE_OPTIONS = [
  { value: "out" as const, label: "Saída" },
  { value: "in" as const, label: "Entrada", activeClassName: "text-income" },
];

interface TransactionDialogProps {
  open: boolean;
  editing: EditableTransaction | null;
  options: TransactionOptions;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDialog({
  open,
  editing,
  options,
  onOpenChange,
}: TransactionDialogProps) {
  function handleDone() {
    onOpenChange(false);
  }

  const { form, error, changeType, submit, removeTransaction } = useTransactionForm({
    editing,
    options,
    onDone: handleDone,
  });
  const type = useWatch({ control: form.control, name: "type" });

  let submitLabel = type === "out" ? "Registrar saída" : "Registrar entrada";
  if (editing) submitLabel = "Salvar alterações";

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Editar lançamento" : "Novo lançamento"}
      submitLabel={submitLabel}
      onSubmit={submit}
      saving={form.formState.isSubmitting}
      error={error}
      footer={editing && <DeleteButton label="Excluir lançamento" onClick={removeTransaction} />}
    >
      <Segmented
        label="Tipo do lançamento"
        options={TYPE_OPTIONS}
        value={type}
        onChange={changeType}
        className="bg-bg"
        optionClassName="py-[9px] text-sm"
      />
      <AmountField field={form.register("amount")} income={type === "in"} />
      <TransactionFields form={form} options={options} showInstallments={!editing} />
    </FormSheet>
  );
}
