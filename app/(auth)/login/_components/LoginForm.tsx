"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postLogin } from "@/actions/authActions/postLogin";
import { postForgotPassword } from "@/actions/authActions/postForgotPassword";
import { FormError } from "@/components/FormError";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input, TALL_FIELD } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormError } from "@/hooks/useFormError";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { error, setServerError } = useFormError(form, ["email", "password"]);
  const { register, handleSubmit, trigger, getValues, formState } = form;

  async function handleSubmitForm(data: LoginInput) {
    const result = await postLogin(data);
    if (!result.ok) return setServerError(result.error);
    toast(`Oi, ${result.name}. Vamos ver o estrago?`);
    router.replace("/");
    router.refresh();
  }

  async function handleClickForgotButton() {
    if (!(await trigger("email"))) return;
    await postForgotPassword({ email: getValues("email") });
    toast("Link enviado pro seu e-mail. Anota a senha dessa vez.");
  }

  return (
    <>
      <form
        noValidate
        onSubmit={handleSubmit(handleSubmitForm)}
        className="flex flex-col gap-3.5"
      >
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
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••"
            className={TALL_FIELD}
            {...register("password")}
          />
        </div>
        <FormError message={error} />
        <Button
          type="submit"
          disabled={formState.isSubmitting}
          className={TALL_FIELD}
        >
          Entrar
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="self-start text-[13px]"
          onClick={handleClickForgotButton}
        >
          Esqueci a senha
        </Button>
      </form>
      <div className="flex items-center gap-1.5 text-sm text-neutral-400">
        Ainda não tem conta?
        <Button variant="ghost" asChild className="text-sm">
          <Link href="/registro">Criar conta</Link>
        </Button>
      </div>
    </>
  );
}
