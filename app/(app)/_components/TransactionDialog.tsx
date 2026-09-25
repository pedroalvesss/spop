"use client";

import { useWatch } from "react-hook-form";
import { FormError } from "@/components/FormError";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TALL_FIELD } from "@/components/ui/input";
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
  const saving = form.formState.isSubmitting;

  function handleClickCancelButton() {
    onOpenChange(false);
  }

  const ctaLabel = editing
    ? "Salvar alterações"
    : type === "out"
      ? "Registrar saída"
      : "Registrar entrada";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="px-[18px] pt-[18px] shadow-lg pc:max-w-[460px]"
      >
        <form noValidate onSubmit={submit} className="contents">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              className="text-sm text-neutral-300"
              onClick={handleClickCancelButton}
            >
              Cancelar
            </Button>
            <DialogTitle className="text-[15px] font-medium">
              {editing ? "Editar lançamento" : "Novo lançamento"}
            </DialogTitle>
            <Button type="submit" variant="ghost" className="text-sm" disabled={saving}>
              Salvar
            </Button>
          </div>
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
          <FormError message={error} />
          <Button type="submit" className={TALL_FIELD} disabled={saving}>
            {ctaLabel}
          </Button>
          {editing && (
            <Button
              type="button"
              variant="ghost"
              className="self-center text-[13px] text-expense"
              onClick={removeTransaction}
            >
              Excluir lançamento
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
