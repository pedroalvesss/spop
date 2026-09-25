import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MoneyFieldProps {
  id: string;
  label: string;
  field: UseFormRegisterReturn;
  placeholder?: string;
}

// Campo de valor em reais: aceita "1.234,56" e abre o teclado numérico no celular.
export function MoneyField({ id, label, field, placeholder = "0,00" }: MoneyFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-neutral-500">
          R$
        </span>
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder}
          className="min-h-11 rounded-xl pl-9 tabular-nums"
          {...field}
        />
      </div>
    </div>
  );
}
