"use client";

import { useEffect } from "react";

// Registra o service worker: é o que torna o app instalável e capaz de receber push.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => console.error("[sw] falhou ao registrar", error));
  }, []);
  return null;
}
