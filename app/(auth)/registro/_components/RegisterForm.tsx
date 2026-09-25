"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postRegister } from "@/actions/authActions/postRegister";
import { FormError } from "@/components/FormError";
import { PasswordFields } from "@/components/PasswordFields";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input, TALL_FIELD } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormError } from "@/hooks/useFormError";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const { error, setServerError } = useFormError(form, [
    "name",
    "email",
    "password",
    "confirmPassword",
  ]);
  const { register, handleSubmit, control, formState } = form;
  const password = useWatch({ control, name: "password" });

  async function handleSubmitForm(data: RegisterInput) {
    const result = await postRegister(data);
    if (!result.ok) return setServerError(result.error);
    toast("Conta criada. Bem-vindo à pobreza organizada.");
    router.replace("/");
    router.refresh();
  }

  return (
    <form noValidate onSubmit={handleSubmit(handleSubmitForm)} className="flex flex-col gap-3.5">
      <div>
        <Label htmlFor="name">Como te chamo?</Label>
        <Input
          id="name"
          autoComplete="given-name"
          placeholder="Pedro"
          className={TALL_FIELD}
          {...register("name")}
        />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          className={TALL_FIELD}
          {...register("email")}
        />
      </div>
      <PasswordFields
        passwordField={register("password")}
        confirmField={register("confirmPassword")}
        password={password}
      />
      <FormError message={error} />
      <Button type="submit" disabled={formState.isSubmitting} className={TALL_FIELD}>
        Começar a organizar
      </Button>
    </form>
  );
}
