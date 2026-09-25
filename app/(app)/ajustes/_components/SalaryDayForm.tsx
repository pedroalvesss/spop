"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { putUserPreferences } from "@/actions/ajustesActions/putUserPreferences";
import { FormSheet } from "@/components/FormSheet";
import { useToast } from "@/components/Toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormError } from "@/hooks/useFormError";
import { dayOfMonth } from "@/lib/schemas/common";

const salarySchema = z.object({ salaryDay: dayOfMonth });
type SalaryInput = z.input<typeof salarySchema>;

interface SalaryDayFormProps {
  salaryDay: number;
  onOpenChange: (open: boolean) => void;
}

export function SalaryDayForm({ salaryDay, onOpenChange }: SalaryDayFormProps) {
  const toast = useToast();
  const form = useForm<SalaryInput>({
    resolver: zodResolver(salarySchema),
    defaultValues: { salaryDay },
  });
  const { error } = useFormError(form, ["salaryDay"]);

  async function handleSubmitForm(data: SalaryInput) {
    await putUserPreferences({ salaryDay: Number(data.salaryDay) });
    toast("Anotado. A contagem regressiva começou.");
    onOpenChange(false);
  }

  return (
    <FormSheet
      open
      onOpenChange={onOpenChange}
      title="Dia do salário"
      submitLabel="Salvar"
      onSubmit={form.handleSubmit(handleSubmitForm)}
      saving={form.formState.isSubmitting}
      error={error}
    >
      <div>
        <Label htmlFor="salary-day">Cai todo dia</Label>
        <Input
          id="salary-day"
          type="number"
          inputMode="numeric"
          className="min-h-11 rounded-xl"
          {...form.register("salaryDay")}
        />
      </div>
      <p className="text-xs text-neutral-500">Usado no &quot;faltam N dias pro salário&quot;.</p>
    </FormSheet>
  );
}
