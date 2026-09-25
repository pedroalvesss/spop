import { Ghost } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  children: React.ReactNode;
}

export function EmptyState({ children }: EmptyStateProps) {
  return (
    <Card className="items-center gap-[5.6px] p-7 text-center text-sm text-neutral-400">
      <Ghost className="text-[28px]" />
      {children}
    </Card>
  );
}
