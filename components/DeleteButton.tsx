"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  label: string;
  onClick: () => void;
}

// Apagar pede um segundo toque: o primeiro só pergunta.
export function DeleteButton({ label, onClick }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);

  function handleClickDeleteButton() {
    if (confirming) onClick();
    else setConfirming(true);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="self-center text-[13px] text-expense"
      onClick={handleClickDeleteButton}
    >
      {confirming ? "Toca de novo pra confirmar" : label}
    </Button>
  );
}
