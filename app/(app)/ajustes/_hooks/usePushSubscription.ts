"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { deletePushSubscription } from "@/actions/notificacoesActions/deletePushSubscription";
import { postPushSubscription } from "@/actions/notificacoesActions/postPushSubscription";

export type PushStatus = "loading" | "unsupported" | "denied" | "off" | "on";

// A chave VAPID vem em base64url; o PushManager quer os bytes.
export function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function pushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

function subscribeNothing() {
  return () => {};
}

export function usePushSubscription() {
  // No servidor não dá pra saber (null); no navegador a resposta não muda.
  const supported = useSyncExternalStore(subscribeNothing, pushSupported, () => null);
  const [subscriptionStatus, setStatus] = useState<Exclude<PushStatus, "unsupported">>("loading");
  const status: PushStatus = supported === false ? "unsupported" : subscriptionStatus;

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (Notification.permission === "denied") setStatus("denied");
        else setStatus(sub ? "on" : "off");
      });
  }, [supported]);

  async function subscribe() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""),
      });
      await postPushSubscription(sub.toJSON());
      setStatus("on");
    } catch {
      setStatus(Notification.permission === "denied" ? "denied" : "off");
    }
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await deletePushSubscription(sub.endpoint);
      await sub.unsubscribe();
    }
    setStatus("off");
  }

  return { status, subscribe, unsubscribe };
}
