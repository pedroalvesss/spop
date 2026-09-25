"use server";

import { sendPushToUser } from "@/lib/push";
import { getUserId } from "@/lib/session";

export async function postTestPush() {
  await sendPushToUser(await getUserId(), {
    title: "Tá funcionando.",
    body: "Agora o SPOP! te avisa antes do boleto te pegar.",
    url: "/ajustes",
    tag: "test",
  });
}
