"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Bell, BellOff, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL!;
const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC!;

/* konwersja base64 → Uint8Array  */
function b64ToUint8(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type State = "idle" | "loading" | "granted" | "denied" | "error";

export default function EnablePush() {
  const [state, setState] = useState<State>("idle");

  /* sprawdź istniejącą subskrypcję po wejściu na stronę */
  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setState("error");
        return;
      }
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) setState("granted");
    })();
  }, []);

  /* ► WŁĄCZ   ---------------------------------------------------------- */
  const enable = async () => {
    try {
      setState("loading");

      /* 1. SW  */
      const reg =
        (await navigator.serviceWorker.getRegistration()) ??
        (await navigator.serviceWorker.register("/sw.js"));

      /* 2. Permission  */
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return setState("denied");

      /* 3. Sub  */
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: b64ToUint8(VAPID),
        }));

      /* 4. Backend  */
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/v1/push/subscribe`, sub, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setState("granted");
    } catch (err) {
      console.error(err);
      setState("error");
    }
  };

  /* ► WYŁĄCZ  ---------------------------------------------------------- */
  const disable = async () => {
    try {
      setState("loading");

      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/v1/push/unsubscribe`,
        { endpoint: sub?.endpoint },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setState("idle");
    } catch (e) {
      console.error(e);
      setState("error");
    }
  };

  /* ---------- UI ---------- */
  const baseCls =
    "px-5 py-3 rounded-lg flex items-center gap-2 transition disabled:opacity-60";

  if (state === "loading")
    return (
      <button disabled className={baseCls + " bg-gray-100 text-gray-600"}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Przetwarzanie…
      </button>
    );

  if (state === "granted")
    return (
      <button
        onClick={disable}
        className={baseCls + " bg-red-100 text-red-700"}
      >
        <BellOff className="w-4 h-4" />
        Wyłącz powiadomienia
      </button>
    );

  return (
    <button onClick={enable} className={baseCls + " bg-emerald-600 text-gray-50 cursor-pointer hover:bg-emerald-500 hover=text=gray-100"}>
      <Bell className="w-4 h-4" />
      {state === "denied" ? "Spróbuj ponownie" : "Włącz powiadomienia"}
    </button>
  );
}
