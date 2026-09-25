"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postAccount } from "@/actions/bancosActions/postAccount";
import { putAccountActive } from "@/actions/bancosActions/putAccountActive";
import { FormError } from "@/components/FormError";
import { Money } from "@/components/HideValues";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormError } from "@/hooks/useFormError";
import { newAccountSchema, type NewAccountInput } from "@/lib/schemas/settings";
import { AccountForm, type EditableAccount } from "./AccountForm";
import { ActionSwitch } from "./ActionSwitch";
import { SettingsCard } from "./SettingsCard";

interface AccountRowProps {
  account: EditableAccount;
  onEdit: (account: EditableAccount) => void;
}

function AccountRow({ account, onEdit }: AccountRowProps) {
  function handleClickAccountButton() {
    onEdit(account);
  }

  async function handleToggleSwitch(active: boolean) {
    await putAccountActive(account.id, active);
  }

  return (
    <div className="flex items-center gap-3 py-[9px]">
      <button
        type="button"
        onClick={handleClickAccountButton}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span className="size-2.5 shrink-0 rounded-full" style={{ background: account.color }} />
        <div className="min-w-0 flex-1">
          <div className="text-sm">{account.name}</div>
          <div className="text-xs text-neutral-500 tabular-nums">
            <Money cents={account.balanceCents} />
          </div>
        </div>
      </button>
      <ActionSwitch
        label={`${account.name} ativa`}
        checked={account.active}
        onToggle={handleToggleSwitch}
      />
    </div>
  );
}

interface AccountsCardProps {
  accounts: EditableAccount[];
}

export function AccountsCard({ accounts }: AccountsCardProps) {
  const toast = useToast();
  const [editing, setEditing] = useState<EditableAccount | null>(null);
  const form = useForm<NewAccountInput>({
    resolver: zodResolver(newAccountSchema),
    defaultValues: { name: "" },
  });
  const { error } = useFormError(form, ["name"]);

  async function handleSubmitForm({ name }: NewAccountInput) {
    await postAccount({ name });
    form.reset({ name: "" });
    toast(`${name.trim()} adicionado.`);
  }

  function handleOpenChange(open: boolean) {
    if (!open) setEditing(null);
  }

  return (
    <SettingsCard
      title="Contas e bancos"
      description="Desligue o que não usa mais. O histórico fica guardado."
    >
      {accounts.map((account) => (
        <AccountRow key={account.id} account={account} onEdit={setEditing} />
      ))}
      <form
        noValidate
        onSubmit={form.handleSubmit(handleSubmitForm)}
        className="mt-2 flex flex-col gap-2"
      >
        <div className="flex gap-2">
          <Input
            aria-label="Novo banco ou carteira"
            placeholder="Novo banco ou carteira (ex.: Inter, VR)"
            className="min-h-10 rounded-[10px]"
            {...form.register("name")}
          />
          <Button
            type="submit"
            className="min-h-10 shrink-0 rounded-[10px]"
            disabled={form.formState.isSubmitting}
          >
            Adicionar
          </Button>
        </div>
        <FormError message={error} />
      </form>
      {editing && (
        <AccountForm key={editing.id} account={editing} onOpenChange={handleOpenChange} />
      )}
    </SettingsCard>
  );
}
