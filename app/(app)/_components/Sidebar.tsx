"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, SignOut } from "@phosphor-icons/react/ssr";
import { postLogout } from "@/actions/authActions/postLogout";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { enabledTabs, tabForPath } from "@/lib/tabs";
import { cn } from "@/lib/utils";
import { useTransactionDialog } from "../_contexts/TransactionDialogContext";

interface SidebarProps {
  userName: string;
  modules: string[];
}

export function Sidebar({ userName, modules }: SidebarProps) {
  const pathname = usePathname();
  const active = tabForPath(pathname).id;
  const { openNew } = useTransactionDialog();

  return (
    <aside className="pc:flex sticky top-0 hidden h-dvh w-[236px] shrink-0 scrollbar-none flex-col gap-[22px] overflow-auto bg-[color-mix(in_srgb,var(--color-surface)_45%,var(--color-bg))] px-3.5 py-[22px]">
      <div className="px-2">
        <Logo size="md" />
      </div>
      <Button className="min-h-10 justify-start rounded-[10px] px-3" onClick={openNew}>
        <Plus className="text-base" />
        Novo lançamento
      </Button>
      <nav className="flex flex-col gap-0.5">
        {enabledTabs(modules).map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={tab.id === active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-sm transition-colors",
              tab.id === active
                ? "bg-accent-900 text-accent-200"
                : "hover:bg-text/6 text-neutral-300",
            )}
          >
            <Icon name={tab.icon} className="text-lg" />
            {tab.name}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2.5 p-2">
        <div className="bg-accent-800 text-accent-200 grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-semibold">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px]">{userName}</div>
          <div className="text-[11px] text-neutral-500">Plano: gratuito (óbvio)</div>
        </div>
        <form action={postLogout}>
          <Button
            variant="icon"
            type="submit"
            title="Sair"
            aria-label="Sair"
            className="text-neutral-400"
          >
            <SignOut className="text-lg" />
          </Button>
        </form>
      </div>
    </aside>
  );
}
