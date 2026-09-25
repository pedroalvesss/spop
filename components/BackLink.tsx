import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

interface BackLinkProps {
  href: string;
}

export function BackLink({ href }: BackLinkProps) {
  return (
    <Button
      variant="ghost"
      asChild
      className="self-start text-sm text-neutral-300"
    >
      <Link href={href}>
        <CaretLeft />
        Voltar
      </Link>
    </Button>
  );
}
