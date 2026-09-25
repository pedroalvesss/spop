"use client";

import { FormError } from "@/components/FormError";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TALL_FIELD } from "@/components/ui/input";

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  submitLabel: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  saving?: boolean;
  error?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Mesmo visual do "Novo lançamento": Cancelar · título · Salvar, campos e CTA contornado.
export function FormSheet({
  open,
  onOpenChange,
  title,
  submitLabel,
  onSubmit,
  saving = false,
  error,
  children,
  footer,
}: FormSheetProps) {
  function handleClickCancelButton() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="px-[18px] pt-[18px] shadow-lg pc:max-w-[460px]"
      >
        <form noValidate onSubmit={onSubmit} className="contents">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              className="text-sm text-neutral-300"
              onClick={handleClickCancelButton}
            >
              Cancelar
            </Button>
            <DialogTitle className="text-[15px] font-medium">{title}</DialogTitle>
            <Button type="submit" variant="ghost" className="text-sm" disabled={saving}>
              Salvar
            </Button>
          </div>
          {children}
          <FormError message={error} />
          <Button type="submit" className={TALL_FIELD} disabled={saving}>
            {submitLabel}
          </Button>
          {footer}
        </form>
      </DialogContent>
    </Dialog>
  );
}
