"use server";

import { pluggyEnabled, pluggyPost } from "@/lib/pluggy";
import { getUserId } from "@/lib/session";

// Token de uso único pro widget da Pluggy abrir no navegador sem expor as credenciais.
export async function postConnectToken() {
  const userId = await getUserId();
  if (!pluggyEnabled())
    return { ok: false as const, error: "Falta configurar a Pluggy no servidor." };
  try {
    const result = await pluggyPost<{ accessToken: string }>("/connect_token", {
      options: { clientUserId: userId, avoidDuplicates: true },
    });
    return { ok: true as const, token: result!.accessToken };
  } catch (error) {
    console.error("[banco] connect token falhou", error);
    return { ok: false as const, error: "A Pluggy não respondeu. Tenta de novo daqui a pouco." };
  }
}
