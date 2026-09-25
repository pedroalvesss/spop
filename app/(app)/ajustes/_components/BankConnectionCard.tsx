"use client";

import { useState, useTransition } from "react";
import { deleteBankConnection } from "@/actions/bancosActions/deleteBankConnection";
import { postBankSync } from "@/actions/bancosActions/postBankSync";
import { DeleteButton } from "@/components/DeleteButton";
import { ListRow } from "@/components/ListRow";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import type { BankConnectionView } from "@/services/bancosService/getBankConnection";
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
  const [editing, setEditing] = useState(false);
  const [syncing, startSync] = useTransition();

  function handleClickEditButton() {
    setEditing(true);
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
            title={connection.bankName}
            meta={`${connection.summary} · ${connection.synced}`}
            onClick={handleClickEditButton}
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
        <Button variant="ghost" className="self-start text-[13px]" onClick={handleClickEditButton}>
          Conectar banco
        </Button>
      )}
      {editing && (
        <BankConnectionForm
          connection={connection}
          accounts={accounts}
          cards={cards}
          today={today}
          onOpenChange={setEditing}
        />
      )}
    </SettingsCard>
  );
}
