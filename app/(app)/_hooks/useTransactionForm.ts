"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteTransactionById } from "@/actions/transacoesActions/deleteTransactionById";
import { postTransaction } from "@/actions/transacoesActions/postTransaction";
import { putTransaction } from "@/actions/transacoesActions/putTransaction";
import { useToast } from "@/components/Toast";
import { useFormError } from "@/hooks/useFormError";
import { todayISO } from "@/lib/dates";
import { centsToInput } from "@/lib/money";
import { CARD_PREFIX, transactionSchema, type TransactionInput } from "@/lib/schemas/transaction";
import type { EditableTransaction, TransactionOptions } from "../_components/transactionTypes";

type TxType = TransactionInput["type"];

interface UseTransactionFormParams {
  editing: EditableTransaction | null;
  options: TransactionOptions;
  onDone: () => void;
}

function firstCategoryId(options: TransactionOptions, type: TxType) {
  const kind = type === "out" ? "expense" : "income";
  return options.categories.find((c) => c.type === kind)?.id ?? "";
}

export function buildDefaults(
  editing: EditableTransaction | null,
  options: TransactionOptions,
): TransactionInput {
  if (editing) {
    return {
      type: editing.amountCents < 0 ? "out" : "in",
      amount: centsToInput(editing.amountCents),
      description: editing.description,
      categoryId: editing.categoryId,
      source: editing.cardId ? `${CARD_PREFIX}${editing.cardId}` : editing.accountId,
      date: editing.date,
      installments: "1",
    };
  }
  return {
    type: "out",
    amount: "",
    description: "",
    categoryId: firstCategoryId(options, "out"),
    source: options.accounts[0]?.id ?? "",
    date: todayISO(),
    installments: "1",
  };
}

export function useTransactionForm({ editing, options, onDone }: UseTransactionFormParams) {
  const toast = useToast();
  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: buildDefaults(editing, options),
  });
  const { error, setServerError } = useFormError(form, [
    "amount",
    "description",
    "categoryId",
    "source",
    "date",
  ]);

  // Trocar o tipo reseta categoria e parcelas; entrada não cai em cartão.
  function changeType(type: TxType) {
    form.setValue("type", type);
    form.setValue("categoryId", firstCategoryId(options, type));
    form.setValue("installments", "1");
    if (type === "in" && form.getValues("source").startsWith(CARD_PREFIX)) {
      form.setValue("source", options.accounts[0]?.id ?? "");
    }
  }

  async function saveTransaction(data: TransactionInput) {
    const result = editing ? await putTransaction(editing.id, data) : await postTransaction(data);
    if (!result.ok) return setServerError(result.error);
    if (editing) toast("Corrigido. O Pedro do futuro agradece.");
    else
      toast(
        data.type === "out"
          ? "Anotado. Doeu, mas tá registrado."
          : "Entrou! Aproveita enquanto dura.",
      );
    onDone();
  }

  async function removeTransaction() {
    if (!editing) return;
    await deleteTransactionById(editing.id);
    toast("Apagado. Como se nunca tivesse acontecido.");
    onDone();
  }

  return { form, error, changeType, submit: form.handleSubmit(saveTransaction), removeTransaction };
}
