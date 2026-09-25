"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteInvestmentById } from "@/actions/investimentosActions/deleteInvestmentById";
import { postInvestment } from "@/actions/investimentosActions/postInvestment";
import { DeleteButton } from "@/components/DeleteButton";
import { FormSheet } from "@/components/FormSheet";
import { MoneyField } from "@/components/MoneyField";
import { useToast } from "@/components/Toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormError } from "@/hooks/useFormError";
import { centsToInput } from "@/lib/money";
import { investmentSchema, type InvestmentInput } from "@/lib/schemas/investment";
import type { InvestmentDto } from "@/services/investimentosService/getInvestments";

interface InvestmentFormProps {
  investment: InvestmentDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvestmentForm({ investment, open, onOpenChange }: InvestmentFormProps) {
  const toast = useToast();
  const form = useForm<InvestmentInput>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: investment?.name ?? "",
      subtitle: investment?.subtitle ?? "",
      amount: investment ? centsToInput(investment.amountCents) : "",
    },
  });
  const { error, setServerError } = useFormError(form, ["name"]);

  async function handleSubmitForm(data: InvestmentInput) {
    const result = await postInvestment(data, investment?.id);
    if (!result.ok) return setServerError(result.error);
    toast(investment ? "Valor atualizado. Rendeu?" : "Investimento anotado. Pouco, mas rendendo.");
    onOpenChange(false);
  }

  async function handleClickDeleteButton() {
    if (!investment) return;
    await deleteInvestmentById(investment.id);
    toast(`${investment.name} saiu da carteira.`);
    onOpenChange(false);
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={investment ? "Atualizar investimento" : "Novo investimento"}
      submitLabel={investment ? "Salvar valor" : "Adicionar investimento"}
      onSubmit={form.handleSubmit(handleSubmitForm)}
      saving={form.formState.isSubmitting}
      error={error}
      footer={
        investment && (
          <DeleteButton label="Excluir investimento" onClick={handleClickDeleteButton} />
        )
      }
    >
      <div>
        <Label htmlFor="inv-name">Nome</Label>
        <Input
          id="inv-name"
          className="min-h-11 rounded-xl"
          placeholder="Ex.: Tesouro Selic 2029"
          {...form.register("name")}
        />
      </div>
      <div>
        <Label htmlFor="inv-subtitle">Detalhe</Label>
        <Input
          id="inv-subtitle"
          className="min-h-11 rounded-xl"
          placeholder="Ex.: 100% do CDI · resgate na hora"
          {...form.register("subtitle")}
        />
      </div>
      <MoneyField id="inv-amount" label="Valor hoje" field={form.register("amount")} />
      <p className="text-xs text-neutral-500">
        Sem integração com banco: atualiza aqui quando olhar o app da corretora.
      </p>
    </FormSheet>
  );
}
