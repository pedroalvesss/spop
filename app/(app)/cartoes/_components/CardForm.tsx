"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteCardById } from "@/actions/cartoesActions/deleteCardById";
import { postCard } from "@/actions/cartoesActions/postCard";
import { DeleteButton } from "@/components/DeleteButton";
import { FormSheet } from "@/components/FormSheet";
import { MoneyField } from "@/components/MoneyField";
import { useToast } from "@/components/Toast";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormError } from "@/hooks/useFormError";
import { centsToInput } from "@/lib/money";
import { cardSchema, type CardInput } from "@/lib/schemas/card";

const FIELD = "min-h-11 rounded-xl";

export interface EditableCard {
  id: string;
  name: string;
  last4: string;
  limitCents: number;
  closingDay: number;
  dueDay: number;
  accountId: string;
}

interface CardFormProps {
  card: EditableCard | null;
  open: boolean;
  accounts: { id: string; name: string }[];
  onOpenChange: (open: boolean) => void;
}

export function CardForm({ card, open, accounts, onOpenChange }: CardFormProps) {
  const toast = useToast();
  const form = useForm<CardInput>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: card?.name ?? "",
      last4: card?.last4 ?? "",
      limit: card ? centsToInput(card.limitCents) : "",
      closingDay: card?.closingDay ?? 3,
      dueDay: card?.dueDay ?? 10,
      accountId: card?.accountId ?? accounts[0]?.id ?? "",
    },
  });
  const { error, setServerError } = useFormError(form, [
    "name",
    "last4",
    "limit",
    "closingDay",
    "dueDay",
    "accountId",
  ]);
  const { register, handleSubmit, formState } = form;

  async function handleSubmitForm(data: CardInput) {
    const result = await postCard(data, card?.id);
    if (!result.ok) return setServerError(result.error);
    toast(card ? "Cartão atualizado." : "Mais um cartão. Usa com juízo.");
    onOpenChange(false);
  }

  async function handleClickDeleteButton() {
    if (!card) return;
    await deleteCardById(card.id);
    toast("Cartão guardado na gaveta. As compras antigas continuam no extrato.");
    onOpenChange(false);
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={card ? "Editar cartão" : "Novo cartão"}
      submitLabel={card ? "Salvar alterações" : "Adicionar cartão"}
      onSubmit={handleSubmit(handleSubmitForm)}
      saving={formState.isSubmitting}
      error={error}
      footer={card && <DeleteButton label="Tirar cartão" onClick={handleClickDeleteButton} />}
    >
      <div className="grid grid-cols-[1fr_110px] gap-2.5">
        <div>
          <Label htmlFor="card-name">Nome</Label>
          <Input id="card-name" className={FIELD} placeholder="Ex.: Nubank" {...register("name")} />
        </div>
        <div>
          <Label htmlFor="card-last4">Final</Label>
          <Input
            id="card-last4"
            inputMode="numeric"
            maxLength={4}
            placeholder="4821"
            className={FIELD}
            {...register("last4")}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <MoneyField id="card-limit" label="Limite" field={register("limit")} />
        <div>
          <Label htmlFor="card-account">Banco</Label>
          <Select id="card-account" className={FIELD} {...register("accountId")}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="card-closing">Fecha todo dia</Label>
          <Input
            id="card-closing"
            type="number"
            inputMode="numeric"
            className={FIELD}
            {...register("closingDay")}
          />
        </div>
        <div>
          <Label htmlFor="card-due">Vence todo dia</Label>
          <Input
            id="card-due"
            type="number"
            inputMode="numeric"
            className={FIELD}
            {...register("dueDay")}
          />
        </div>
      </div>
    </FormSheet>
  );
}
