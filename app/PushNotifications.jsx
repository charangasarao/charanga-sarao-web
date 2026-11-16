"use client";

import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "./firebase";

const STORAGE_KEY = "sarao_push_prompt_v1";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (character) => character.charCodeAt(0));
}

async function getSubscriptionId(endpoint) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(endpoint),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export default function PushNotifications({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const storageKey = `${STORAGE_KEY}_${user.id ?? user.nombre}`;

  useEffect(() => {
    if (window.localStorage.getItem(storageKey) === null) {
      setIsOpen(true);
    }
  }, [storageKey]);

  const guardarPreferencia = (preference) => {
    window.localStorage.setItem(storageKey, preference);
    setIsOpen(false);
  };

  const activarNotificaciones = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
      if (!vapidPublicKey) {
        throw new Error(
          "El servicio de notificaciones todavía no está configurado. Consulta la sección de notificaciones del README.",
        );
      }
      if (
        !window.isSecureContext ||
        !("Notification" in window) ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        throw new Error(
          "Este navegador no permite notificaciones push. En iPhone o iPad, añade primero la app a la pantalla de inicio y ábrela desde allí.",
        );
      }
      if (Notification.permission === "denied") {
        throw new Error(
          "Las notificaciones están bloqueadas en los ajustes del navegador. Actívalas allí y vuelve a iniciar sesión.",
        );
      }

      const permission =
        Notification.permission === "granted"
          ? "granted"
          : await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error(
          "No se ha concedido permiso para enviar notificaciones.",
        );
      }

      await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
      });
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));
      const subscriptionId = await getSubscriptionId(subscription.endpoint);

      await setDoc(doc(collection(db, "push_subscriptions"), subscriptionId), {
        userId: user.id == null ? null : String(user.id),
        userName: user.nombre || "",
        endpoint: subscription.endpoint,
        subscription: subscription.toJSON(),
        updatedAt: new Date().toISOString(),
      });

      guardarPreferencia("accepted");
    } catch (error) {
      console.error("No se pudieron activar las notificaciones:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron activar las notificaciones.",
      );
    } finally {
      setIsBusy(false);
    }
  };

  const rechazarNotificaciones = async () => {
    setIsBusy(true);
    setErrorMessage("");

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration("/");
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
          const subscriptionId = await getSubscriptionId(subscription.endpoint);
          await subscription.unsubscribe();
          await deleteDoc(
            doc(collection(db, "push_subscriptions"), subscriptionId),
          );
        }
      }
      guardarPreferencia("declined");
    } catch (error) {
      console.error("No se pudieron rechazar las notificaciones:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron desactivar las notificaciones.",
      );
    } finally {
      setIsBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="push-notifications-title"
        className="w-full max-w-md rounded-3xl border border-green-500/40 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-green-500/15 p-3 text-green-400">
              <Bell className="h-6 w-6" />
            </div>
            <h2
              id="push-notifications-title"
              className="text-xl font-black text-white"
            >
              Notificaciones de Sarao
            </h2>
          </div>
          <button
            type="button"
            aria-label="Rechazar notificaciones"
            disabled={isBusy}
            onClick={rechazarNotificaciones}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-zinc-300">
          ¿Quieres recibir un aviso cuando se añada un bolo o ensayo al
          calendario y cuando se publique una ruta para un bolo al que estás
          apuntado?
        </p>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">
          En iPhone y iPad, las notificaciones push requieren añadir la app a la
          pantalla de inicio y abrirla desde allí.
        </p>

        {errorMessage && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-300"
          >
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={rechazarNotificaciones}
            className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
          >
            Ahora no
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={activarNotificaciones}
            className="flex-1 rounded-xl bg-green-500 px-4 py-3 text-sm font-black text-black hover:bg-green-400 disabled:opacity-50"
          >
            {isBusy ? "Un momento..." : "Aceptar"}
          </button>
        </div>
      </section>
    </div>
  );
}
