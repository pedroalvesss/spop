"use client";

import { useState } from "react";
import { postConnectToken } from "@/actions/bancosActions/postConnectToken";

// Conector "MeuPluggy" (GET /connectors): o jeito grátis de ligar o próprio banco.
const MEU_PLUGGY = 200;

interface PluggyConnectOptions {
  onItem: (itemId: string) => void;
  onError: (message: string) => void;
}

// Abre o widget oficial da Pluggy direto no Meu Pluggy e devolve o Item ID autorizado.
export function usePluggyConnect({ onItem, onError }: PluggyConnectOptions) {
  const [opening, setOpening] = useState(false);

  async function open() {
    setOpening(true);
    try {
      const token = await postConnectToken();
      if (!token.ok) return onError(token.error);
      // O SDK mexe em window, então só carrega no clique.
      const { PluggyConnect } = await import("pluggy-connect-sdk");
      await new PluggyConnect({
        connectToken: token.token,
        connectorIds: [MEU_PLUGGY],
        selectedConnectorId: MEU_PLUGGY,
        theme: "dark",
        language: "pt",
        onSuccess: ({ item }) => onItem(item.id),
        onError: ({ message }) => onError(message),
      }).init();
    } catch {
      onError("Não deu pra abrir a janela da Pluggy. Cola o Item ID aqui embaixo.");
    } finally {
      setOpening(false);
    }
  }

  return { open, opening };
}
