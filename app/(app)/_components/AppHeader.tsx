"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react/ssr";
import { useHideValues } from "@/components/HideValues";
import { Logo } from "@/components/Logo";
import { tabForPath } from "@/lib/tabs";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  userName: string;
  homeSub: string;
}

// No Início do celular vai o logo; nas outras abas (e no PC) vai o título grande.
export function AppHeader({ userName, homeSub }: AppHeaderProps) {
  const tab = tabForPath(usePathname());
  const { hidden, toggle } = useHideValues();
  const isHome = tab.id === "home";
  const title = isHome ? `Oi, ${userName}` : tab.name;
  const sub = isHome ? homeSub : tab.sub;

  return (
    <header className="flex min-h-11 items-center gap-3">
      {isHome && (
        <div className="pc:hidden flex-1">
          <Logo size="sm" />
        </div>
      )}
      <div className={cn("min-w-0 flex-1", isHome && "pc:block hidden")}>
        <h1 className="pc:text-[28px] text-[30px] tracking-[-0.025em]">{title}</h1>
        <div className="mt-0.5 text-[13px] text-neutral-500">{sub}</div>
      </div>
      <button
        type="button"
        onClick={toggle}
        title="Ocultar valores"
        aria-label={hidden ? "Mostrar valores" : "Ocultar valores"}
        aria-pressed={hidden}
        className="hover:bg-text/7 grid size-10 shrink-0 place-items-center rounded-full text-xl text-neutral-300 transition-colors"
      >
        {hidden ? <EyeSlash /> : <Eye />}
      </button>
      <Link
        href="/ajustes"
        aria-label="Ajustes"
        className="bg-accent-800 text-accent-200 grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold"
      >
        {userName.charAt(0).toUpperCase()}
      </Link>
    </header>
  );
}
