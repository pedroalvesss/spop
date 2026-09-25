"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, SquaresFour } from "@phosphor-icons/react/ssr";
import { Icon } from "@/components/Icon";
import { bottomBar, tabForPath, type Tab } from "@/lib/tabs";
import { cn } from "@/lib/utils";
import { useTransactionDialog } from "../_contexts/TransactionDialogContext";
import { MoreSheet } from "./MoreSheet";

const ITEM = "flex min-h-12 flex-1 flex-col items-center gap-[3px] text-[11px]";

interface TabBarItemProps {
  tab: Tab;
  active: boolean;
}

function TabBarItem({ tab, active }: TabBarItemProps) {
  return (
    <Link
      href={tab.href}
      aria-current={active ? "page" : undefined}
      className={cn(ITEM, active ? "text-accent" : "text-neutral-500")}
    >
      <Icon name={tab.icon} weight={active ? "fill" : "regular"} className="text-2xl" />
      {tab.short}
    </Link>
  );
}

interface TabBarProps {
  modules: string[];
}

export function TabBar({ modules }: TabBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const active = tabForPath(usePathname()).id;
  const { openNew } = useTransactionDialog();
  const { left, right, more } = bottomBar(modules);
  const moreActive = more.some((t) => t.id === active);

  function handleClickMoreButton() {
    setMoreOpen(true);
  }

  return (
    <>
      <nav className="pc:hidden fixed inset-x-0 bottom-0 z-30 flex h-[calc(72px+env(safe-area-inset-bottom))] items-start bg-[color-mix(in_srgb,var(--color-bg)_82%,transparent)] px-2 pt-2 shadow-[0_-1px_0_var(--color-neutral-900)] backdrop-blur-[20px]">
        {left.map((tab) => (
          <TabBarItem key={tab.id} tab={tab} active={tab.id === active} />
        ))}
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={openNew}
            title="Novo lançamento"
            aria-label="Novo lançamento"
            className="bg-bg text-accent active:bg-accent-900 -mt-1 grid size-[52px] place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--color-accent)]"
          >
            <Plus className="text-2xl" />
          </button>
        </div>
        {right.map((tab) => (
          <TabBarItem key={tab.id} tab={tab} active={tab.id === active} />
        ))}
        <button
          type="button"
          onClick={handleClickMoreButton}
          className={cn(ITEM, moreActive ? "text-accent" : "text-neutral-500")}
        >
          <SquaresFour weight={moreActive ? "fill" : "regular"} className="text-2xl" />
          Mais
        </button>
      </nav>
      <MoreSheet tabs={more} open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
