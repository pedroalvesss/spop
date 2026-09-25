import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { ResetPasswordForm } from "./_components/ResetPasswordForm";

export const metadata: Metadata = { title: "Nova senha · SPOP!" };

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/redefinir-senha">) {
  const { token } = await searchParams;
  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/login" />
      <div className="flex flex-col gap-1">
        <h2 className="text-[26px]">Nova senha</h2>
        <p className="text-sm text-neutral-400">Essa é pra lembrar.</p>
      </div>
      <ResetPasswordForm token={typeof token === "string" ? token : ""} />
    </div>
  );
}
