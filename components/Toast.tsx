"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react/ssr";

const TOAST_MS = 2600;

const ToastContext = createContext<(message: string) => void>(() => {});

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((message: string) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message });
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div aria-live="polite" role="status">
        {toast && (
          <div
            key={toast.id}
            className="fixed top-[calc(16px+env(safe-area-inset-top))] left-1/2 z-60 flex w-max max-w-[88%] -translate-x-1/2 animate-toast-in items-center gap-2 rounded-xl bg-surface px-3.5 py-2.5 text-[13px] shadow-md"
          >
            <CheckCircle weight="fill" className="shrink-0 text-base text-accent" />
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
