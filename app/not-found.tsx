import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { TALL_FIELD } from "@/components/ui/input";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-8">
      <div className="flex w-full max-w-[360px] flex-col gap-7">
        <Logo size="lg" />
        <div className="flex flex-col gap-1">
          <h2 className="text-[26px]">Essa página não existe.</h2>
          <p className="text-sm text-neutral-400">Igual ao dinheiro no fim do mês.</p>
        </div>
        <Button asChild className={TALL_FIELD}>
          <Link href="/">Voltar pro início</Link>
        </Button>
      </div>
    </main>
  );
}
