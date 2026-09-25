"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { TransactionDialog } from "../_components/TransactionDialog";
import type { EditableTransaction, TransactionOptions } from "../_components/transactionTypes";

interface TransactionDialogActions {
  openNew: () => void;
  openEdit: (transaction: EditableTransaction) => void;
}

const TransactionDialogContext = createContext<TransactionDialogActions>({
  openNew: () => {},
  openEdit: () => {},
});

interface TransactionDialogProviderProps {
  options: TransactionOptions;
  children: React.ReactNode;
}

// Estado de interface só: qual lançamento está aberto. Os dados vêm do servidor.
export function TransactionDialogProvider({ options, children }: TransactionDialogProviderProps) {
  const [state, setState] = useState({
    open: false,
    editing: null as EditableTransaction | null,
    key: 0,
  });

  const openNew = useCallback(() => {
    setState((s) => ({ open: true, editing: null, key: s.key + 1 }));
  }, []);

  const openEdit = useCallback((editing: EditableTransaction) => {
    setState((s) => ({ open: true, editing, key: s.key + 1 }));
  }, []);

  const actions = useMemo(() => ({ openNew, openEdit }), [openNew, openEdit]);

  function handleOpenChange(open: boolean) {
    setState((s) => ({ ...s, open }));
  }

  return (
    <TransactionDialogContext.Provider value={actions}>
      {children}
      <TransactionDialog
        key={state.key}
        open={state.open}
        editing={state.editing}
        options={options}
        onOpenChange={handleOpenChange}
      />
    </TransactionDialogContext.Provider>
  );
}

export function useTransactionDialog() {
  return useContext(TransactionDialogContext);
}
