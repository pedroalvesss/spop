"use client";

import { useOptimistic, useTransition } from "react";
import { Switch } from "@/components/ui/switch";

interface ActionSwitchProps {
  label: string;
  checked: boolean;
  onToggle: (next: boolean) => Promise<unknown>;
}

// Switch que muda na hora e salva no servidor em seguida.
export function ActionSwitch({ label, checked, onToggle }: ActionSwitchProps) {
  const [optimistic, setOptimistic] = useOptimistic(checked);
  const [, startTransition] = useTransition();

  function handleCheckedChange(next: boolean) {
    startTransition(async () => {
      setOptimistic(next);
      await onToggle(next);
    });
  }

  return <Switch aria-label={label} checked={optimistic} onCheckedChange={handleCheckedChange} />;
}
