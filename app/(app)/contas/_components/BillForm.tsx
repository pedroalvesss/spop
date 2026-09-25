"use client";

import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteBillById } from "@/actions/contasPagarActions/deleteBillById";
import { postBill } from "@/actions/contasPagarActions/postBill";
import { DeleteButton } from "@/components/DeleteButton";
import { FormSheet } from "@/components/FormSheet";
import { IconPicker } from "@/components/IconPicker";
import { MoneyField } from "@/components/MoneyField";
import { useToast } from "@/components/Toast";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormError } from "@/hooks/useFormError";
import type { BillView } from "@/lib/bills";
import { centsToInput } from "@/lib/money";
import { billSchema, type BillInput } from "@/lib/schemas/bill";

const FIELD = "min-h-11 rounded-xl";

export interface BillFormOptions {
  categories: { id: string; name: string; type: "expense" | "income" }[];
  accounts: { id: string; name: string }[];
}

interface BillFormProps {
  bill: BillView | null;
  open: boolean;
  options: BillFormOptions;
  onOpenChange: (open: boolean) => void;
}

function billDefaults(bill: BillView | null, options: BillFormOptions): BillInput {
  return {
    name: bill?.name ?? "",
    icon: bill?.icon ?? "receipt",
    amount: bill ? centsToInput(bill.amountCents) : "",
    dueDay: bill?.dueDay ?? 10,
    categoryId: bill?.categoryId ?? options.categories.find((c) => c.type === "expense")?.id ?? "",
    accountId: bill?.accountId ?? options.accounts[0]?.id ?? "",
  };
}

export function BillForm({ bill, open, options, onOpenChange }: BillFormProps) {
  const toast = useToast();
  const form = useForm<BillInput>({
    resolver: zodResolver(billSchema),
    defaultValues: billDefaults(bill, options),
  });
  const { error, setServerError } = useFormError(form, ["name", "amount", "dueDay"]);
  const { register, control, handleSubmit, formState } = form;
  const { field: iconField } = useController({ control, name: "icon" });

  async function handleSubmitForm(data: BillInput) {
    const result = await postBill(data, bill?.id);
    if (!result.ok) return setServerError(result.error);
    toast(bill ? "Conta atualizada." : "Conta anotada. Agora ela não te pega de surpresa.");
    onOpenChange(false);
  }

  async function handleClickDeleteButton() {
    if (!bill) return;
    await deleteBillById(bill.id);
    toast(`${bill.name} saiu da lista.`);
    onOpenChange(false);
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={bill ? "Editar conta" : "Nova conta"}
      submitLabel={bill ? "Salvar alterações" : "Adicionar conta"}
      onSubmit={handleSubmit(handleSubmitForm)}
      saving={formState.isSubmitting}
      error={error}
      footer={bill && <DeleteButton label="Excluir conta" onClick={handleClickDeleteButton} />}
    >
      <div>
        <Label htmlFor="bill-name">Nome</Label>
        <Input id="bill-name" className={FIELD} placeholder="Ex.: Internet" {...register("name")} />
      </div>
      <IconPicker value={iconField.value} onChange={iconField.onChange} />
      <div className="grid grid-cols-2 gap-2.5">
        <MoneyField id="bill-amount" label="Valor" field={register("amount")} />
        <div>
          <Label htmlFor="bill-day">Vence todo dia</Label>
          <Input
            id="bill-day"
            type="number"
            inputMode="numeric"
            min={1}
            max={31}
            className={FIELD}
            {...register("dueDay")}
          />
        </div>
        <div>
          <Label htmlFor="bill-category">Categoria</Label>
          <Select id="bill-category" className={FIELD} {...register("categoryId")}>
            {options.categories
              .filter((c) => c.type === "expense")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="bill-account">Pago com</Label>
          <Select id="bill-account" className={FIELD} {...register("accountId")}>
            {options.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </FormSheet>
  );
}
