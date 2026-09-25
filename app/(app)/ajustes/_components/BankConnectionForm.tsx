"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postBankConnection } from "@/actions/bancosActions/postBankConnection";
import { FormSheet } from "@/components/FormSheet";
import { useToast } from "@/components/Toast";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormError } from "@/hooks/useFormError";
import { bankConnectionSchema, type BankConnectionInput } from "@/lib/schemas/settings";
import type { BankConnectionView } from "@/services/bancosService/getBankConnection";
import { importedMessage } from "./bankMessages";

const FIELD = "min-h-11 rounded-xl";

interface Option {
  id: string;
  name: string;
}

interface BankConnectionFormProps {
  connection: BankConnectionView | null;
  accounts: Option[];
  cards: Option[];
  today: string;
  onOpenChange: (open: boolean) => void;
}

export function BankConnectionForm({
  connection,
  accounts,
  cards,
  today,
  onOpenChange,
}: BankConnectionFormProps) {
  const toast = useToast();
  const form = useForm<BankConnectionInput>({
    resolver: zodResolver(bankConnectionSchema),
    defaultValues: {
      itemId: connection?.itemId ?? "",
      accountId: connection?.accountId ?? accounts[0]?.id ?? "",
      cardId: connection ? (connection.cardId ?? "") : (cards[0]?.id ?? ""),
      since: connection?.since ?? today,
    },
  });
  const { error, setServerError } = useFormError(form, ["itemId", "accountId", "cardId", "since"]);

  async function handleSubmitForm(data: BankConnectionInput) {
    const result = await postBankConnection(data);
    if (!result.ok) return setServerError(result.error);
    toast(`Banco conectado. ${importedMessage(result.imported)}`);
    onOpenChange(false);
  }

  return (
    <FormSheet
      open
      onOpenChange={onOpenChange}
      title={connection ? "Editar conexão" : "Conectar banco"}
      submitLabel={connection ? "Salvar alterações" : "Conectar"}
      onSubmit={form.handleSubmit(handleSubmitForm)}
      saving={form.formState.isSubmitting}
      error={error}
    >
      <div>
        <Label htmlFor="bank-item">Item ID da Pluggy</Label>
        <Input
          id="bank-item"
          className={FIELD}
          autoComplete="off"
          spellCheck={false}
          placeholder="Ex.: 8d4b5c1e-2f3a-…"
          {...form.register("itemId")}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label htmlFor="bank-account">Extrato cai em</Label>
          <Select id="bank-account" className={FIELD} {...form.register("accountId")}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="bank-card">Compras no cartão</Label>
          <Select id="bank-card" className={FIELD} {...form.register("cardId")}>
            <option value="">Não importar</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="bank-since">Importar a partir de</Label>
        <Input id="bank-since" type="date" className={FIELD} {...form.register("since")} />
      </div>
      <p className="text-xs text-pretty text-neutral-500">
        O Item ID fica no dashboard da Pluggy, no app de demonstração, depois de ligar o banco no
        Meu Pluggy. Antes da data escolhida nada entra, pra não duplicar o que você já lançou.
      </p>
    </FormSheet>
  );
}
