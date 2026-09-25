"use client";

import { createContext, useContext, useState } from "react";
import { formatBRL, formatSigned, HIDDEN_MONEY, splitCents } from "@/lib/money";

interface HideValuesState {
  hidden: boolean;
  toggle: () => void;
}

const HideValuesContext = createContext<HideValuesState>({ hidden: false, toggle: () => {} });

interface HideValuesProviderProps {
  initialHidden: boolean;
  children: React.ReactNode;
}

export function HideValuesProvider({ initialHidden, children }: HideValuesProviderProps) {
  const [hidden, setHidden] = useState(initialHidden);

  function toggle() {
    setHidden((h) => !h);
  }

  return (
    <HideValuesContext.Provider value={{ hidden, toggle }}>{children}</HideValuesContext.Provider>
  );
}

export function useHideValues() {
  return useContext(HideValuesContext);
}

interface MoneyProps {
  cents: number;
  signed?: boolean;
  // Extrato mostra só "••••", sem o "R$".
  hiddenText?: string;
}

export function Money({ cents, signed = false, hiddenText = HIDDEN_MONEY }: MoneyProps) {
  const { hidden } = useHideValues();
  if (hidden) return <>{hiddenText}</>;
  return <>{signed ? formatSigned(cents) : formatBRL(cents)}</>;
}

interface BalanceProps {
  cents: number;
}

// Saldo grande: centavos em neutral-500.
export function Balance({ cents }: BalanceProps) {
  const { hidden } = useHideValues();
  if (hidden) return <>{HIDDEN_MONEY}</>;
  const [int, dec] = splitCents(cents);
  return (
    <>
      {int}
      <span className="text-neutral-500">{dec}</span>
    </>
  );
}

interface PrivateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Textos que carregam valor: com os valores ocultos, troca pelo fallback (ou some).
export function Private({ children, fallback = null }: PrivateProps) {
  const { hidden } = useHideValues();
  return <>{hidden ? fallback : children}</>;
}
