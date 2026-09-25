"use client";

import { PlusCircle } from "@phosphor-icons/react/ssr";

interface AddCardProps {
  label: string;
  onClick: () => void;
}

// Card tracejado de "adicionar", no fim das grades (Nova caixinha, Nova dívida).
export function AddCard({ label, onClick }: AddCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[180px] flex-col items-center justify-center gap-[5.6px] rounded-2xl p-[18px] text-neutral-400 shadow-[inset_0_0_0_1.5px_var(--color-neutral-800)] transition-colors hover:text-accent"
    >
      <PlusCircle className="text-[26px]" />
      <span className="text-sm">{label}</span>
    </button>
  );
}
