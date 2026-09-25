"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Tab } from "@/lib/tabs";

interface MoreSheetProps {
  tabs: Tab[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Bottom sheet com os módulos que não couberam na tab bar, mais Ajustes.
export function MoreSheet({ tabs, open, onOpenChange }: MoreSheetProps) {
  function handleClickItemLink() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="px-4 pt-2.5 pb-[max(34px,env(safe-area-inset-bottom))]"
      >
        <div className="h-[5px] w-9 self-center rounded-[3px] bg-neutral-700" />
        <DialogTitle className="px-1 text-[15px] font-medium">Tudo</DialogTitle>
        <div className="grid grid-cols-3 gap-2.5">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={handleClickItemLink}
              className="flex flex-col items-center gap-2 rounded-[14px] bg-bg px-1.5 py-3.5 text-center text-xs active:bg-accent-900"
            >
              <Icon name={tab.icon} className="text-2xl text-accent" />
              {tab.name}
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
