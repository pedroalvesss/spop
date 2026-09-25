"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postResetPassword } from "@/actions/authActions/postResetPassword";
import { FormError } from "@/components/FormError";
import { PasswordFields } from "@/components/PasswordFields";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { TALL_FIELD } from "@/components/ui/input";
import { useFormError } from "@/hooks/useFormError";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/schemas/auth";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const toast = useToast();
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });
  const { error, setServerError } = useFormError(form, [
    "password",
    "confirmPassword",
  ]);
  const { register, handleSubmit, control, formState } = form;
  const password = useWatch({ control, name: "password" });

  async function handleSubmitForm(data: ResetPasswordInput) {
    const result = await postResetPassword(data);
    if (!result.ok) return setServerError(result.error);
    toast("Senha trocada. Agora é só entrar.");
    router.replace("/login");
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleSubmitForm)}
      className="flex flex-col gap-3.5"
    >
      <PasswordFields
        label="Nova senha"
        passwordField={register("password")}
        confirmField={register("confirmPassword")}
        password={password}
      />
      <FormError message={error} />
      <Button
        type="submit"
        disabled={formState.isSubmitting}
        className={TALL_FIELD}
      >
        Salvar senha
      </Button>
    </form>
  );
}
