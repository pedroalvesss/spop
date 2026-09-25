"use server";

import { revalidatePath } from "next/cache";
import { syncBankConnection } from "@/lib/bankSync";
import { getUserId } from "@/lib/session";

export async function postBankSync() {
  const userId = await getUserId();
  try {
    const result = await syncBankConnection(userId);
    if (!result) return { ok: false as const, error: "Nenhum banco conectado." };
    revalidatePath("/", "layout");
    return { ok: true as const, imported: result.imported };
  } catch (error) {
    console.error("[banco] sincronização falhou", error);
    return { ok: false as const, error: "A Pluggy não respondeu. Tenta de novo daqui a pouco." };
  }
}
