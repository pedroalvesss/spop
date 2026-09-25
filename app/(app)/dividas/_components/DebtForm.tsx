"use client";

import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteDebtById } from "@/actions/dividasActions/deleteDebtById";
import { postDebt } from "@/actions/dividasActions/postDebt";
import { DeleteButton } from "@/components/DeleteButton";
import { FormSheet } from "@/components/FormSheet";
import { IconPicker } from "@/components/IconPicker";
import { MoneyField } from "@/components/MoneyField";
import { useToast } from "@/components/Toast";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormError } from "@/hooks/useFormError";
import { centsToInput } from "@/lib/money";
import { debtSchema, type DebtInput } from "@/lib/schemas/debt";
import type { DebtDto } from "@/services/dividasService/getDebts";

const FIELD = "min-h-11 rounded-xl";

interface DebtFormProps {
  debt: DebtDto | null;
  open: boolean;
  accounts: { id: string; name: string }[];
  onOpenChange: (open: boolean) => void;
}

export function DebtForm({ debt, open, accounts, onOpenChange }: DebtFormProps) {
  const toast = useToast();
  const form = useForm<DebtInput>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      name: debt?.name ?? "",
      subtitle: debt?.subtitle ?? "",
      icon: debt?.icon ?? "bank",
      installment: debt ? centsToInput(debt.installmentCents) : "",
      totalInstallments: debt?.totalInstallments ?? 12,
      paidInstallments: debt?.paidInstallments ?? 0,
      accountId: debt?.accountId ?? "",
    },
  });
  const { error, setServerError } = useFormError(form, [
    "name",
    "installment",
    "totalInstallments",
    "paidInstallments",
  ]);
  const { register, control, handleSubmit, formState } = form;
  const { field: iconField } = useController({ control, name: "icon" });

  async function handleSubmitForm(data: DebtInput) {
    const result = await postDebt(data, debt?.id);
    if (!result.ok) return setServerError(result.error);
    toast(debt ? "Dívida atualizada." : "Anotada. Encarar é o primeiro passo.");
    onOpenChange(false);
  }

  async function handleClickDeleteButton() {
    if (!debt) return;
    await deleteDebtById(debt.id);
    toast(`${debt.name} saiu da lista.`);
    onOpenChange(false);
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={debt ? "Editar dívida" : "Nova dívida"}
      submitLabel={debt ? "Salvar alterações" : "Adicionar dívida"}
      onSubmit={handleSubmit(handleSubmitForm)}
      saving={formState.isSubmitting}
      error={error}
      footer={debt && <DeleteButton label="Excluir dívida" onClick={handleClickDeleteButton} />}
    >
      <div>
        <Label htmlFor="debt-name">Nome</Label>
        <Input
          id="debt-name"
          className={FIELD}
          placeholder="Ex.: Empréstimo da mãe"
          {...register("name")}
        />
      </div>
      <div>
        <Label htmlFor="debt-subtitle">Detalhe</Label>
        <Input
          id="debt-subtitle"
          className={FIELD}
          placeholder="Ex.: Sem juros, com culpa"
          {...register("subtitle")}
        />
      </div>
      <IconPicker value={iconField.value} onChange={iconField.onChange} />
      <div className="grid grid-cols-2 gap-2.5">
        <MoneyField id="debt-installment" label="Parcela" field={register("installment")} />
        <div>
          <Label htmlFor="debt-account">Pago com</Label>
          <Select id="debt-account" className={FIELD} {...register("accountId")}>
            <option value="">Não lançar</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="debt-total">Total de parcelas</Label>
          <Input
            id="debt-total"
            type="number"
            inputMode="numeric"
            className={FIELD}
            {...register("totalInstallments")}
          />
        </div>
        <div>
          <Label htmlFor="debt-paid">Já pagas</Label>
          <Input
            id="debt-paid"
            type="number"
            inputMode="numeric"
            className={FIELD}
            {...register("paidInstallments")}
          />
        </div>
      </div>
    </FormSheet>
  );
}
