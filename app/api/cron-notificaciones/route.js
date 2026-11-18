import { createHash } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const TIME_ZONE = "Europe/Madrid";
const ANSWERED_STATES = new Set(["puedo", "no", "tal_vez"]);
const OUTFITS = {
  "Por definir": "Por definir",
  Negro: "Camiseta Negra",
  Blanco: "Camiseta Blanca",
  "Full Print": "Full Print Sarao",
};

function getAdminApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Faltan las credenciales de Firebase Admin en Vercel.");
  }
  return getApps().find((item) => item.name === "[DEFAULT]") ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
}

function madridDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function daysBetween(from, to) {
  const a = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(from || "");
  const b = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(to || "");
  if (!a || !b) return null;
  return (Date.UTC(+b[1], +b[2] - 1, +b[3]) - Date.UTC(+a[1], +a[2] - 1, +a[3])) / 86400000;
}

function formatDate(value) {
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value || "");
  return match ? `${match[3]}/${match[2]}/${match[1]}` : (value || "sin indicar");
}

function memberId(member) {
  return String(member?.id ?? member?.nombre ?? "").trim();
}

function eventTitle(event) {
  return event?.titulo || event?.lugar || "Bolo";
}

function assignedRoute(event, member) {
  const name = String(member?.nombre || "").trim().toLocaleLowerCase("es");
  const routes = Array.isArray(event?.cochesAsignados) ? event.cochesAsignados : [];
  return routes.find((route) =>
    (Array.isArray(route?.pasajeros) ? route.pasajeros : [])
      .some((passenger) => String(passenger).trim().toLocaleLowerCase("es") === name)
  ) || routes.find((route) =>
    String(route?.conductor || "").trim().toLocaleLowerCase("es") === name
  ) || null;
}

function pickupPoint(route, member) {
  const entries = route?.recogidasPasajeros || {};
  const name = String(member?.nombre || "").trim().toLocaleLowerCase("es");
  const found = Object.entries(entries).find(([key]) => key.trim().toLocaleLowerCase("es") === name);
  return found?.[1] || "";
}

function boloReminder(event, member) {
  const lines = [
    `Bolo: ${eventTitle(event)}`,
    `Fecha: ${formatDate(event.fecha)}`,
    `Inicio: ${event.horaInicio || "sin indicar"}`,
  ];
  if (event.horaFin) lines.push(`Fin: ${event.horaFin}`);
  lines.push(`Vestuario: ${OUTFITS[event.vestuario] || event.vestuario || "Por definir"}`);
  const route = assignedRoute(event, member);
  if (!route) {
    lines.push("Coche: No tienes una ruta de coche asignada.");
  } else {
    const stops = (Array.isArray(route.paradas) ? route.paradas : [])
      .map((stop) => [stop?.lugar, stop?.hora].filter(Boolean).join(" "))
      .filter(Boolean);
    lines.push(`Coche: Conductor: ${route.conductor || "sin indicar"}; origen: ${route.origen || "sin indicar"}; salida: ${route.horaSalida || "sin indicar"}; paradas: ${stops.length ? stops.join(", ") : "ninguna"}; destino: ${route.destino || "sin indicar"}; llegada prevista: ${route.horaLlegada || "sin indicar"}.`);
    const pickup = pickupPoint(route, member);
    if (pickup) lines.push(`Tu punto de recogida: ${pickup}`);
  }
  return { title: "Tu bolo es dentro de 48 horas", body: lines.join("\n"), tag: `bolo-48h-${event.id}`, url: `/?evento=${encodeURIComponent(String(event.id))}` };
}

function ensayoReminder(event) {
  const lines = [
    `Ensayo: ${eventTitle(event)}`,
    `Fecha: ${formatDate(event.fecha)}`,
    `Hora: ${event.horaInicio || "sin indicar"}`,
    `Lugar: ${event.lugar || "sin indicar"}`,
  ];
  if (event.repertorio) lines.push(`Repertorio: ${event.repertorio}`);
  return { title: "Mañana tienes ensayo", body: lines.join("\n"), tag: `ensayo-24h-${event.id}`, url: `/?evento=${encodeURIComponent(String(event.id))}` };
}

function availabilityReminder(event) {
  return {
    title: "Pendiente de disponibilidad",
    body: `¿Puedes venir a "${eventTitle(event)}" el ${formatDate(event.fecha)}? Indica tu disponibilidad en la app.`,
    tag: `disponibilidad-${event.id}`,
    url: `/?evento=${encodeURIComponent(String(event.id))}`,
  };
}

function dedupeId(type, eventId, userId, date) {
  return createHash("sha256").update([type, eventId, userId, date].join(":")).digest("hex");
}

async function claim(db, id, details) {
  const ref = db.collection("notificaciones_programadas").doc(id);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists) return false;
    transaction.create(ref, { ...details, createdAt: new Date().toISOString() });
    return true;
  });
}

async function sendToMember({ db, messaging, tokenDocs, member, event, type, today }) {
  const userId = memberId(member);
  if (!userId) return { sent: 0, skipped: 1 };
  const tokens = [...new Set(tokenDocs
    .filter((item) => String(item.userId ?? "").trim() === userId)
    .map((item) => String(item.token || "").trim())
    .filter(Boolean))];
  if (!tokens.length) return { sent: 0, skipped: 1 };

  let payload;
  if (type === "availability") payload = availabilityReminder(event);
  else if (type === "bolo-48h") payload = boloReminder(event, member);
  else payload = ensayoReminder(event);

  const markerId = dedupeId(type, event.id, userId, today);
  const marker = { type, eventId: String(event.id), userId, eventDate: event.fecha };
  if (!(await claim(db, markerId, marker))) return { sent: 0, skipped: 1 };

  try {
    let success = 0;
    for (let offset = 0; offset < tokens.length; offset += 500) {
      const response = await messaging.sendEachForMulticast({
        tokens: tokens.slice(offset, offset + 500),
        notification: { title: payload.title, body: payload.body },
        webpush: { notification: { icon: "/PEGATINAS-512.png", badge: "/PEGATINAS-192.png", tag: payload.tag, data: { url: payload.url } } },
      });
      success += response.successCount;
    }
    if (success === 0) {
      await db.collection("notificaciones_programadas").doc(markerId).delete();
      return { sent: 0, skipped: 1 };
    }
    return { sent: success, skipped: 0 };
  } catch (error) {
    await db.collection("notificaciones_programadas").doc(markerId).delete();
    throw error;
  }
}

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  try {
    const app = getAdminApp();
    const db = getFirestore(app);
    const messaging = getMessaging(app);
    const [dataSnapshot, tokenSnapshot] = await Promise.all([
      db.collection("charanga").doc("datos_generales").get(),
      db.collection("tokens_notificaciones").get(),
    ]);
    if (!dataSnapshot.exists) {
      return NextResponse.json({ success: true, message: "No hay datos de calendario.", sent: 0 });
    }

    const data = dataSnapshot.data() || {};
    const members = Array.isArray(data.miembros) ? data.miembros : [];
    const events = Array.isArray(data.bolos) ? data.bolos : [];
    const tokenDocs = tokenSnapshot.docs.map((snapshot) => snapshot.data());
    const today = madridDate();
    let sent = 0;
    let skipped = 0;
    const errors = [];

    for (const event of events) {
      if (!event?.id || !["confirmado", "ensayo"].includes(event.estadoBolo)) continue;
      const daysUntil = daysBetween(today, event.fecha);
      if (daysUntil === null || daysUntil < 0) continue;

      for (const member of members) {
        const state = member?.disponibilidadBolos?.[String(event.id)]?.estado;
        let type = null;
        if (event.estadoBolo === "confirmado" && daysUntil <= 7 &&
            !ANSWERED_STATES.has(state)) type = "availability";
        else if (event.estadoBolo === "confirmado" && daysUntil === 2 && state === "puedo") type = "bolo-48h";
        else if (event.estadoBolo === "ensayo" && daysUntil === 1) type = "ensayo-24h";
        if (!type) continue;

        try {
          const result = await sendToMember({ db, messaging, tokenDocs, member, event, type, today });
          sent += result.sent;
          skipped += result.skipped;
        } catch (error) {
          errors.push({ eventId: String(event.id), memberId: memberId(member), error: error instanceof Error ? error.message : "Error de envío" });
        }
      }
    }

    return NextResponse.json({ success: errors.length === 0, date: today, sent, skipped, errors });
  } catch (error) {
    console.error("Error en el programador de notificaciones:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Error inesperado." }, { status: 500 });
  }
}
