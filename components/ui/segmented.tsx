import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  href?: string;
  activeClassName?: string;
}

interface SegmentedItemProps<T extends string> {
  option: SegmentedOption<T>;
  active: boolean;
  className?: string;
  onSelect?: (value: T) => void;
}

function SegmentedItem<T extends string>({
  option,
  active,
  className,
  onSelect,
}: SegmentedItemProps<T>) {
  const classes = cn(
    "flex-1 rounded-lg px-2.5 py-2 text-center text-[13px] transition-colors",
    active ? cn("bg-neutral-800 text-text", option.activeClassName) : "text-neutral-400",
    className,
  );

  function handleClickOptionButton() {
    onSelect?.(option.value);
  }

  if (option.href) {
    return (
      <Link href={option.href} replace aria-current={active} className={classes}>
        {option.label}
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={active}
      className={classes}
      onClick={handleClickOptionButton}
    >
      {option.label}
    </button>
  );
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  label: string;
  onChange?: (value: T) => void;
  className?: string;
  optionClassName?: string;
}

// Container surface (ou bg dentro de modal), opção ativa em neutral-800.
export function Segmented<T extends string>({
  options,
  value,
  label,
  onChange,
  className,
  optionClassName,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex gap-0.5 rounded-[11px] bg-surface p-[3px]", className)}
    >
      {options.map((option) => (
        <SegmentedItem
          key={option.value}
          option={option}
          active={option.value === value}
          className={optionClassName}
          onSelect={onChange}
        />
      ))}
    </div>
  );
}
