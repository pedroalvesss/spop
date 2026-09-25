"use client";

import { useState, useTransition } from "react";
import { deleteBankConnection } from "@/actions/bancosActions/deleteBankConnection";
import { postBankSync } from "@/actions/bancosActions/postBankSync";
import { DeleteButton } from "@/components/DeleteButton";
import { ListRow } from "@/components/ListRow";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import type { BankConnectionView } from "@/services/bancosService/getBankConnection";
import { usePluggyConnect } from "../_hooks/usePluggyConnect";
import { BankConnectionForm } from "./BankConnectionForm";
import { importedMessage } from "./bankMessages";
import { SettingsCard } from "./SettingsCard";

interface Option {
  id: string;
  name: string;
}

interface BankConnectionCardProps {
  connection: BankConnectionView | null;
  accounts: Option[];
  cards: Option[];
  today: string;
}

export function BankConnectionCard({
  connection,
  accounts,
  cards,
  today,
}: BankConnectionCardProps) {
  const toast = useToast();
  // null = formulário fechado; "" = digitar o Item ID; id = veio do widget.
  const [formItemId, setFormItemId] = useState<string | null>(null);
  const [syncing, startSync] = useTransition();
  const pluggy = usePluggyConnect({ onItem: setFormItemId, onError: toast });

  function handleClickPluggyButton() {
    pluggy.open();
  }

  function handleClickManualButton() {
    setFormItemId("");
  }

  function handleOpenChangeForm(open: boolean) {
    if (!open) setFormItemId(null);
  }

  function handleClickSyncButton() {
    startSync(async () => {
      const result = await postBankSync();
      toast(result.ok ? importedMessage(result.imported) : result.error);
    });
  }

  async function handleClickDisconnectButton() {
    await deleteBankConnection();
    toast("Banco desconectado. O que já entrou continua aqui.");
  }

  return (
    <SettingsCard
      title="Banco conectado"
      description="Open Finance pelo Meu Pluggy. O banco manda as novidades uma vez por dia."
    >
      {connection ? (
        <>
          <ListRow
            icon="bank"
            title={connection.title}
            meta={`${connection.summary} · ${connection.synced}`}
            onClick={handleClickManualButton}
          />
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-[13px]"
              disabled={syncing}
              onClick={handleClickSyncButton}
            >
              {syncing ? "Sincronizando…" : "Sincronizar agora"}
            </Button>
            <DeleteButton label="Desconectar" onClick={handleClickDisconnectButton} />
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-x-4">
          <Button
            variant="ghost"
            className="text-[13px]"
            disabled={pluggy.opening}
            onClick={handleClickPluggyButton}
          >
            {pluggy.opening ? "Abrindo…" : "Conectar pelo Meu Pluggy"}
          </Button>
          <Button
            variant="ghost"
            className="text-[13px] text-neutral-400"
            onClick={handleClickManualButton}
          >
            Colar Item ID
          </Button>
        </div>
      )}
      {formItemId !== null && (
        <BankConnectionForm
          connection={connection}
          accounts={accounts}
          cards={cards}
          today={today}
          itemId={formItemId}
          onOpenChange={handleOpenChangeForm}
        />
      )}
    </SettingsCard>
  );
}
