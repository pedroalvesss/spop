"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { putAccount } from "@/actions/bancosActions/putAccount";
import { FormSheet } from "@/components/FormSheet";
import { MoneyField } from "@/components/MoneyField";
import { useToast } from "@/components/Toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormError } from "@/hooks/useFormError";
import { centsToInput } from "@/lib/money";
import { accountSchema, type AccountInput } from "@/lib/schemas/settings";

export interface EditableAccount {
  id: string;
  name: string;
  color: string;
  active: boolean;
  balanceCents: number;
}

interface AccountFormProps {
  account: EditableAccount;
  onOpenChange: (open: boolean) => void;
}

export function AccountForm({ account, onOpenChange }: AccountFormProps) {
  const toast = useToast();
  const sign = account.balanceCents < 0 ? "-" : "";
  const form = useForm<AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: account.name, balance: sign + centsToInput(account.balanceCents) },
  });
  const { error, setServerError } = useFormError(form, ["name", "balance"]);

  async function handleSubmitForm(data: AccountInput) {
    const result = await putAccount(account.id, data);
    if (!result.ok) return setServerError(result.error);
    toast(`${data.name.trim()} atualizado.`);
    onOpenChange(false);
  }

  return (
    <FormSheet
      open
      onOpenChange={onOpenChange}
      title="Editar conta"
      submitLabel="Salvar alterações"
      onSubmit={form.handleSubmit(handleSubmitForm)}
      saving={form.formState.isSubmitting}
      error={error}
    >
      <div>
        <Label htmlFor="account-name">Nome</Label>
        <Input id="account-name" className="min-h-11 rounded-xl" {...form.register("name")} />
      </div>
      <MoneyField id="account-balance" label="Saldo hoje" field={form.register("balance")} />
      <p className="text-xs text-neutral-500">
        Ajusta o saldo pra bater com o app do banco. Os lançamentos continuam iguais.
      </p>
    </FormSheet>
  );
}
