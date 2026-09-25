"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { PasswordStrength } from "@/components/PasswordStrength";
import { Input, TALL_FIELD } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordFieldsProps {
  passwordField: UseFormRegisterReturn;
  confirmField: UseFormRegisterReturn;
  password: string;
  label?: string;
}

export function PasswordFields({
  passwordField,
  confirmField,
  password,
  label = "Senha",
}: PasswordFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="password">{label}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          className={TALL_FIELD}
          {...passwordField}
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="De novo, sem errar"
          className={TALL_FIELD}
          {...confirmField}
        />
      </div>
      <PasswordStrength password={password} />
    </>
  );
}
