import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

interface IconBoxProps {
  icon: string;
  className?: string;
}

export function IconBox({ icon, className }: IconBoxProps) {
  return (
    <div
      className={cn(
        "bg-bg grid size-[38px] shrink-0 place-items-center rounded-[10px] text-lg text-neutral-300",
        className,
      )}
    >
      <Icon name={icon} />
    </div>
  );
}

interface ListRowProps {
  icon: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  value?: React.ReactNode;
  leading?: React.ReactNode;
  className?: string;
  metaClassName?: string;
  valueClassName?: string;
  onClick?: () => void;
}

// Linha de lista: ícone 38×38, título 14 com ellipsis, meta 12 e valor tabular à direita.
export function ListRow({
  icon,
  title,
  meta,
  value,
  leading,
  className,
  metaClassName,
  valueClassName,
  onClick,
}: ListRowProps) {
  const Root = onClick ? "button" : "div";
  return (
    <Root
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn("flex w-full items-center gap-3 py-2 text-left", className)}
    >
      {leading}
      <IconBox icon={icon} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">{title}</div>
        {meta && <div className={cn("text-xs text-neutral-500", metaClassName)}>{meta}</div>}
      </div>
      {value !== undefined && (
        <div className={cn("text-sm tabular-nums", valueClassName)}>{value}</div>
      )}
    </Root>
  );
}
