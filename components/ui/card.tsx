import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CardProps = React.ComponentProps<"div">;

// Superfície, raio 16, sem borda. Padding 16 por padrão; o card principal da aba usa 20.
export function Card({ className, ...props }: CardProps) {
  return <div className={cn("flex flex-col rounded-2xl bg-surface p-4", className)} {...props} />;
}

interface CardHeaderProps {
  title: string;
  href?: string;
  linkLabel?: string;
}

export function CardHeader({ title, href, linkLabel = "Ver todas" }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[15px] font-medium">{title}</span>
      {href && (
        <Button variant="ghost" asChild className="text-[13px]">
          <Link href={href}>{linkLabel}</Link>
        </Button>
      )}
    </div>
  );
}

// Grade dos cards no PC: auto-fit de 300px, gap 14. O card principal ocupa a linha toda.
export function CardGrid({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3.5", className)}
      {...props}
    />
  );
}
