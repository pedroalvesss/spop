import { Card } from "@/components/ui/card";

interface SettingsCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

// Card de Ajustes: título 15/500 e descrição 12px, com as linhas coladas.
export function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <Card className="gap-0 px-4 pt-1.5 pb-3">
      {title && <div className="pt-2.5 pb-0.5 text-[15px] font-medium">{title}</div>}
      {description && <div className="pb-1.5 text-xs text-neutral-500">{description}</div>}
      {children}
    </Card>
  );
}
