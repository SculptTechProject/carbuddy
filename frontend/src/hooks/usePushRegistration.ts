import { useEffect } from "react";
import axios from "axios";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_KEY!;

function urlBase64ToUint8Array(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function usePushRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    (async () => {
      const sw = await navigator.serviceWorker.register("/sw.js");

      const sub =
        (await sw.pushManager.getSubscription()) ??
        (await sw.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
        }));

      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.post("/api/v1/push/subscribe", sub, {
        headers: { Authorization: `Bearer ${token}` },
      });
    })();
  }, []);
}
