import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { RegisterForm } from "./_components/RegisterForm";

export const metadata: Metadata = { title: "Criar conta · SPOP!" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/login" />
      <div className="flex flex-col gap-1">
        <h2 className="text-[26px]">Criar conta</h2>
        <p className="text-sm text-pretty text-neutral-400">
          O primeiro passo pra ser pobre com método.
        </p>
      </div>
      <RegisterForm />
      <div className="text-xs text-pretty text-neutral-500">
        Seus dados ficam só com você. Nem o Pedro do futuro vai julgar.
      </div>
    </div>
  );
}
