import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = { title: "Entrar · SPOP!" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3.5">
        <Logo size="lg" />
        <div className="text-[13px] text-neutral-500">Sistema de Pobreza Organizada do Pedro!</div>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-[26px]">Bem-vindo de volta.</h2>
        <p className="text-sm text-neutral-400">Sua pobreza estava te esperando, organizadinha.</p>
      </div>
      <LoginForm />
    </div>
  );
}
