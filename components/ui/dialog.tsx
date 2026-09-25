"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content>;

// Bottom sheet no celular, modal centralizado no PC. O overlay é o container flex
// (padrão "scrollable overlay" do Radix) pra animação não brigar com o centramento.
function DialogContent({ className, children, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 flex animate-fade-in flex-col items-center justify-end bg-neutral-900/60 pc:justify-center">
        <DialogPrimitive.Content
          className={cn(
            "scrollbar-none flex max-h-[92dvh] w-full animate-sheet-in flex-col gap-3.5 overflow-auto rounded-t-[22px] bg-surface pb-[max(28px,env(safe-area-inset-bottom))] outline-none pc:rounded-[18px]",
            className,
          )}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  );
}

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogTitle, DialogDescription };
