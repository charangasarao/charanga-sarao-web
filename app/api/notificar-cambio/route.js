import { createHash } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { NextResponse } from "next/server";

export const maxDuration = 60;

function adminApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Faltan las credenciales de Firebase Admin.");
  }
  return getApps().find((item) => item.name === "[DEFAULT]") ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
}

const clean = (value) => String(value ?? "").trim();
const eventName = (event) => clean(event?.titulo || event?.lugar || "Bolo");
const dateTime = (event) => [clean(event?.fecha), clean(event?.horaInicio)].filter(Boolean).join(" a las ");

function notificationFor(type, previousEvent, currentEvent) {
  if (type === "fecha" && previousEvent?.estadoBolo === "confirmado" &&
      currentEvent?.estadoBolo === "confirmado" &&
      (previousEvent.fecha !== currentEvent.fecha || previousEvent.horaInicio !== currentEvent.horaInicio)) {
    return {
      title: "Cambio de fecha u hora de un bolo",
      body: `Ha cambiado "${eventName(currentEvent)}". Antes: ${dateTime(previousEvent) || "sin indicar"}. Ahora: ${dateTime(currentEvent) || "sin indicar"}.`,
    };
  }
  if (type === "vestuario" && previousEvent?.estadoBolo === "confirmado" &&
      currentEvent?.estadoBolo === "confirmado" &&
      previousEvent.vestuario !== currentEvent.vestuario) {
    return {
      title: "Cambio de vestuario",
      body: `El vestuario de "${eventName(currentEvent)}" (${dateTime(currentEvent) || "fecha sin indicar"}) ha cambiado a: ${clean(currentEvent.vestuario) || "Por definir"}.`,
    };
  }
  if (type === "cancelacion" && previousEvent?.estadoBolo === "confirmado" && !currentEvent) {
    return {
      title: "Bolo cancelado o eliminado",
      body: `Se ha cancelado "${eventName(previousEvent)}", previsto para ${dateTime(previousEvent) || "una fecha sin indicar"}.`,
    };
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, previousEvent, currentEvent } = body || {};
    if (!["fecha", "vestuario", "cancelacion"].includes(type) || !previousEvent?.id) {
      return NextResponse.json({ success: false, error: "Solicitud no válida." }, { status: 400 });
    }

    const notification = notificationFor(type, previousEvent, currentEvent);
    if (!notification) {
      return NextResponse.json({ success: true, sent: 0, skipped: true, reason: "No hay un cambio notificable." });
    }

    const app = adminApp();
    const db = getFirestore(app);
    const messaging = getMessaging(app);
    const tokensSnapshot = await db.collection("tokens_notificaciones").get();
    const tokens = [...new Set(tokensSnapshot.docs
      .map((item) => clean(item.data()?.token))
      .filter(Boolean))];

    if (!tokens.length) {
      return NextResponse.json({ success: true, sent: 0, reason: "No hay dispositivos registrados." });
    }

    const signature = createHash("sha256")
      .update(JSON.stringify({ type, previousEvent, currentEvent: currentEvent || null }))
      .digest("hex");
    const deliveryRef = db.collection("notificaciones_cambios").doc(signature);
    const claimed = await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(deliveryRef);
      if (existing.exists) return false;
      transaction.create(deliveryRef, {
        type,
        eventId: String(previousEvent.id),
        status: "sending",
        createdAt: new Date().toISOString(),
      });
      return true;
    });

    if (!claimed) {
      return NextResponse.json({ success: true, sent: 0, skipped: true, reason: "Este cambio ya fue notificado." });
    }

    try {
      let successCount = 0;
      let failureCount = 0;
      for (let offset = 0; offset < tokens.length; offset += 500) {
        const result = await messaging.sendEachForMulticast({
          tokens: tokens.slice(offset, offset + 500),
          notification,
          webpush: {
            notification: {
              icon: "/PEGATINAS-512.png",
              badge: "/PEGATINAS-192.png",
              tag: `cambio-${type}-${previousEvent.id}`,
              data: { url: `/?evento=${encodeURIComponent(String(previousEvent.id))}` },
            },
          },
        });
        successCount += result.successCount;
        failureCount += result.failureCount;
      }
      if (successCount === 0) {
        await deliveryRef.delete();
        return NextResponse.json({ success: false, sent: 0, failureCount }, { status: 502 });
      }
      await deliveryRef.update({ status: "sent", successCount, failureCount, sentAt: new Date().toISOString() });
      return NextResponse.json({ success: true, sent: successCount, failureCount });
    } catch (error) {
      await deliveryRef.delete();
      throw error;
    }
  } catch (error) {
    console.error("Error enviando notificación de cambio:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Error inesperado." }, { status: 500 });
  }
}
