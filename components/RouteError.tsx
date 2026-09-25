"use client";

import { useEffect } from "react";
import { WarningCircle } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

interface RouteErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export function RouteError({ error, retry }: RouteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-surface flex flex-col items-center gap-3 rounded-2xl p-7 text-center text-sm text-neutral-400">
      <WarningCircle className="text-expense text-[28px]" />
      Não deu pra carregar essa tela.
      <Button
        variant="secondary"
        className="min-h-11 rounded-xl"
        onClick={retry}
      >
        Tentar de novo
      </Button>
    </div>
  );
}
