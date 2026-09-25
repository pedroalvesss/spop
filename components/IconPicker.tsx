"use client";

import { Icon, ICON_CHOICES } from "@/components/Icon";
import { cn } from "@/lib/utils";

interface IconOptionProps {
  name: string;
  selected: boolean;
  onSelect: (name: string) => void;
}

function IconOption({ name, selected, onSelect }: IconOptionProps) {
  function handleClickIconButton() {
    onSelect(name);
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={name}
      onClick={handleClickIconButton}
      className={cn(
        "grid size-[38px] shrink-0 place-items-center rounded-[10px] bg-bg text-lg transition-colors",
        selected
          ? "text-accent shadow-[inset_0_0_0_1.5px_var(--color-accent)]"
          : "text-neutral-400",
      )}
    >
      <Icon name={name} />
    </button>
  );
}

interface IconPickerProps {
  value: string;
  onChange: (name: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div>
      <span className="mb-[5px] block text-xs text-text/70">Ícone</span>
      <div
        role="radiogroup"
        aria-label="Ícone"
        className="-mx-[18px] scrollbar-none flex gap-2 overflow-x-auto px-[18px] py-0.5"
      >
        {ICON_CHOICES.map((name) => (
          <IconOption key={name} name={name} selected={name === value} onSelect={onChange} />
        ))}
      </div>
    </div>
  );
}
