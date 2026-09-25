import "server-only";
import webpush from "web-push";
import { db } from "@/lib/db";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const configured = Boolean(publicKey && privateKey);

if (configured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "https://github.com/pedroalvesss/spop",
    publicKey!,
    privateKey!,
  );
}

// Manda pra todos os aparelhos inscritos da pessoa. Inscrição morta (404/410) é apagada.
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!configured) return;
  const subscriptions = await db.pushSubscription.findMany({ where: { userId } });
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db.pushSubscription.deleteMany({ where: { id: sub.id } });
        } else {
          console.error("[push] falhou", error);
        }
      }
    }),
  );
}
