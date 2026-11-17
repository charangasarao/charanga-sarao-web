const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const webpush = require("web-push");

initializeApp();

const vapidPublicKey = defineSecret("VAPID_PUBLIC_KEY");
const vapidPrivateKey = defineSecret("VAPID_PRIVATE_KEY");
const vapidSubject = defineSecret("VAPID_SUBJECT");
const db = getFirestore();

const EVENT_STATES = new Set(["confirmado", "ensayo"]);
const TIME_ZONE = "Europe/Madrid";
const REMINDER_HOUR = 9;

function getId(value) {
  return value == null ? "" : String(value);
}

function eventUrl(eventId) {
  return `/?evento=${encodeURIComponent(getId(eventId))}`;
}

function getNewRoutes(previousEvent, currentEvent) {
  const previousRouteIds = new Set(
    (previousEvent?.cochesAsignados || []).map((route) => getId(route.id)),
  );
  return (currentEvent.cochesAsignados || []).filter(
    (route) => route.id != null && !previousRouteIds.has(getId(route.id)),
  );
}

async function getSubscriptions(userIds) {
  const subscriptions = db.collection("push_subscriptions");
  if (userIds === null) {
    const snapshot = await subscriptions.get();
    return snapshot.docs.filter((subscription) => !subscription.data().disabled);
  }

  const uniqueIds = [...new Set((userIds || []).filter(Boolean))];
  if (uniqueIds.length === 0) return [];
  const snapshots = await Promise.all(
    Array.from({ length: Math.ceil(uniqueIds.length / 30) }, (_, index) =>
      subscriptions.where("userId", "in", uniqueIds.slice(index * 30, (index + 1) * 30)).get(),
    ),
  );
  return snapshots.flatMap((snapshot) => snapshot.docs).filter((subscription) => !subscription.data().disabled);
}

async function sendPush(userIds, notification) {
  const subscriptions = await getSubscriptions(userIds);
  await Promise.all(subscriptions.map(async (subscriptionDocument) => {
    const subscription = subscriptionDocument.data().subscription;
    if (!subscription) return;
    try {
      await webpush.sendNotification(subscription, JSON.stringify(notification));
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        try {
          await subscriptionDocument.ref.delete();
        } catch (deleteError) {
          logger.error("No se pudo eliminar una suscripción caducada.", { subscriptionId: subscriptionDocument.id, error: deleteError });
        }
        return;
      }
      logger.error("No se pudo enviar una notificación push.", { subscriptionId: subscriptionDocument.id, error });
    }
  }));
}

function configurePush() {
  webpush.setVapidDetails(vapidSubject.value(), vapidPublicKey.value(), vapidPrivateKey.value());
}

function madridParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function madridLocalToUtc(dateString, timeString = "00:00") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateString || ""))) return null;
  const match = String(timeString || "").match(/(\d{1,2}):(\d{2})/);
  const hour = match ? Number(match[1]) : 0;
  const minute = match ? Number(match[2]) : 0;
  if (hour > 23 || minute > 59) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute);
  const parts = madridParts(new Date(naiveUtc));
  const representedUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
  return new Date(naiveUtc - (representedUtc - naiveUtc));
}

function eventTimestamp(calendarEvent) {
  const time = String(calendarEvent.horaInicio || "00:00").replace(/h/gi, "").trim();
  return madridLocalToUtc(calendarEvent.fecha, time);
}

function dateDifferenceInMadrid(from, to) {
  const a = madridParts(from);
  const b = madridParts(to);
  const aDay = Date.UTC(Number(a.year), Number(a.month) - 1, Number(a.day));
  const bDay = Date.UTC(Number(b.year), Number(b.month) - 1, Number(b.day));
  return Math.round((bDay - aDay) / 86400000);
}

function formatRoute(route) {
  const parts = [];
  if (route.vehiculo) parts.push(`Coche: ${route.vehiculo}`);
  if (route.origen) parts.push(`Salida: ${route.origen}`);
  if (route.horaSalida) parts.push(`hora ${route.horaSalida}`);
  if (route.paradas?.length) {
    parts.push(`Paradas: ${route.paradas.map((stop) => [stop.lugar, stop.hora].filter(Boolean).join(" ")).join(", ")}`);
  }
  if (route.destino) parts.push(`Destino: ${route.destino}`);
  if (route.horaLlegada) parts.push(`llegada ${route.horaLlegada}`);
  return parts.join(" · ");
}

exports.notifyOnCalendarChanges = onDocumentUpdated(
  {
    document: "charanga/datos_generales",
    secrets: [vapidPublicKey, vapidPrivateKey, vapidSubject],
  },
  async (event) => {
    const previousData = event.data.before.data();
    const currentData = event.data.after.data();
    const previousEvents = previousData.bolos || [];
    const currentEvents = currentData.bolos || [];
    const notifications = [];
    const members = currentData.miembros || [];
    const allMemberIds = members.map((member) => getId(member.id)).filter(Boolean);

    for (const calendarEvent of currentEvents) {
      const previousEvent = previousEvents.find((candidate) => getId(candidate.id) === getId(calendarEvent.id));
      const wasOnCalendar = EVENT_STATES.has(previousEvent?.estadoBolo);
      const isOnCalendar = EVENT_STATES.has(calendarEvent.estadoBolo);

      // Se conserva el aviso existente de alta de bolo/ensayo.
      if (isOnCalendar && !wasOnCalendar) {
        notifications.push({
          userIds: null,
          payload: {
            title: calendarEvent.estadoBolo === "ensayo" ? "Nuevo ensayo en el calendario" : "Nuevo bolo en el calendario",
            body: calendarEvent.estadoBolo === "ensayo" ? "Tenemos nuevo ENSAYO fijado panzabucheeee" : "Tenemos nuevo BOLO croquetoooooo",
            tag: `evento-${getId(calendarEvent.id)}`,
            url: eventUrl(calendarEvent.id),
          },
        });
      }

      if (!previousEvent || !calendarEvent.id) continue;

      // Nuevos avisos: cambios de fecha/hora y vestuario a toda la plantilla.
      if (isOnCalendar && wasOnCalendar && previousEvent.estadoBolo === "confirmado" && calendarEvent.estadoBolo === "confirmado") {
        const dateChanged = previousEvent.fecha !== calendarEvent.fecha || previousEvent.horaInicio !== calendarEvent.horaInicio || previousEvent.horaFin !== calendarEvent.horaFin;
        if (dateChanged) {
          notifications.push({
            userIds: allMemberIds,
            payload: {
              title: "Cambio de fecha u horario del bolo",
              body: `${calendarEvent.lugar || calendarEvent.titulo || "El bolo"}: ${calendarEvent.fecha || "fecha por confirmar"} · ${calendarEvent.horaInicio || "hora por confirmar"}`,
              tag: `cambio-horario-${getId(calendarEvent.id)}-${getId(calendarEvent.fecha)}-${getId(calendarEvent.horaInicio)}`,
              url: eventUrl(calendarEvent.id),
            },
          });
        }
      }

      if (isOnCalendar && wasOnCalendar && previousEvent.vestuario !== calendarEvent.vestuario && calendarEvent.estadoBolo === "confirmado") {
        notifications.push({
          userIds: allMemberIds,
          payload: {
            title: "Cambio de vestuario",
            body: `${calendarEvent.lugar || calendarEvent.titulo || "Bolo"}: ${calendarEvent.vestuario || "vestuario por definir"}`,
            tag: `vestuario-${getId(calendarEvent.id)}-${getId(calendarEvent.vestuario)}`,
            url: eventUrl(calendarEvent.id),
          },
        });
      }

      // Se conserva el aviso existente de nuevas rutas, dirigido a asistentes.
      const newRoutes = getNewRoutes(previousEvent, calendarEvent);
      if (newRoutes.length > 0) {
        const attendingMemberIds = members
          .filter((member) => member.disponibilidadBolos?.[getId(calendarEvent.id)]?.estado === "puedo")
          .map((member) => getId(member.id));
        for (const route of newRoutes) {
          notifications.push({
            userIds: attendingMemberIds,
            payload: {
              title: "Nueva ruta para un bolo al que estás apuntado",
              body: `${route.creadoPor || route.conductor || "Alguien"} ha puesto su putivuelta para este bolo`,
              tag: `ruta-${getId(calendarEvent.id)}-${getId(route.id)}`,
              url: eventUrl(calendarEvent.id),
            },
          });
        }
      }
    }

    // La app elimina los eventos del calendario; una baja de un evento confirmado
    // se interpreta como cancelación. Los presupuestos no confirmados se ignoran.
    const removedEvents = previousEvents.filter((previousEvent) =>
      EVENT_STATES.has(previousEvent.estadoBolo) &&
      !currentEvents.some((currentEvent) => getId(currentEvent.id) === getId(previousEvent.id)),
    );
    for (const removedEvent of removedEvents) {
      notifications.push({
        userIds: allMemberIds,
        payload: {
          title: removedEvent.estadoBolo === "ensayo" ? "Ensayo eliminado del calendario" : "Bolo cancelado",
          body: `${removedEvent.lugar || removedEvent.titulo || "El evento"} · ${removedEvent.fecha || ""}`,
          tag: `cancelacion-${getId(removedEvent.id)}`,
          url: "/",
        },
      });
    }

    if (notifications.length === 0) return;
    configurePush();
    await Promise.all(notifications.map(({ userIds, payload }) => sendPush(userIds, payload)));
  },
);

// Revisa cada 15 minutos las ventanas de recordatorio. Las claves idempotentes
// impiden que una misma persona reciba dos veces el mismo aviso.
exports.sendEventReminders = onSchedule(
  {
    schedule: "every 15 minutes",
    timeZone: TIME_ZONE,
    secrets: [vapidPublicKey, vapidPrivateKey, vapidSubject],
    region: "europe-west1",
  },
  async () => {
    const snapshot = await db.doc("charanga/datos_generales").get();
    if (!snapshot.exists) return;
    const data = snapshot.data();
    const events = data.bolos || [];
    const members = data.miembros || [];
    const now = new Date();
    const localNow = madridParts(now);
    const nowMs = now.getTime();
    const jobs = [];

    for (const calendarEvent of events) {
      if (!EVENT_STATES.has(calendarEvent.estadoBolo)) continue;
      const eventId = getId(calendarEvent.id);
      const startsAt = eventTimestamp(calendarEvent);
      if (!eventId || !startsAt || startsAt.getTime() <= nowMs) continue;

      if (calendarEvent.estadoBolo === "confirmado") {
        const hoursUntil = (startsAt.getTime() - nowMs) / 3600000;
        if (hoursUntil > 47.75 && hoursUntil <= 48) {
          const attendees = members.filter((member) => member.disponibilidadBolos?.[eventId]?.estado === "puedo");
          for (const member of attendees) {
            const normalizedMemberName = String(member.nombre || "").trim().toLocaleLowerCase("es");
            const route = (calendarEvent.cochesAsignados || []).find((item) =>
              (item.pasajeros || []).some((passenger) => {
                // La app guarda los pasajeros como nombres (strings), no como objetos.
                const passengerName = typeof passenger === "string"
                  ? passenger
                  : passenger?.nombre || passenger?.name || "";
                const passengerId = typeof passenger === "object"
                  ? passenger.id ?? passenger.miembroId ?? passenger.userId
                  : null;
                return getId(passengerId) === getId(member.id) ||
                  String(passengerName).trim().toLocaleLowerCase("es") === normalizedMemberName;
              }),
            );
            const pickupPoint = route?.recogidasPasajeros?.[normalizedMemberName];
            const routeDetails = route
              ? [
                  `Vas con ${route.conductor || "el conductor asignado"}`,
                  formatRoute(route),
                  pickupPoint ? `Tu punto de recogida: ${pickupPoint}` : "",
                ].filter(Boolean).join(" · ")
              : "No tienes una ruta de coche asignada.";
            const body = [
              `${calendarEvent.lugar || calendarEvent.titulo || "Bolo"} · ${calendarEvent.fecha}`,
              `Horario: ${calendarEvent.horaInicio || "por confirmar"}${calendarEvent.horaFin ? `–${calendarEvent.horaFin}` : ""}`,
              routeDetails,
              `Vestuario: ${calendarEvent.vestuario || "por definir"}`,
            ].join(" | ");
            jobs.push({ key: `bolo-48h-${eventId}-${getId(member.id)}`, userIds: [getId(member.id)], payload: {
              title: "Tu bolo es dentro de 48 horas",
              body: body.slice(0, 350),
              tag: `bolo-48h-${eventId}`,
              url: eventUrl(eventId),
            }});
          }
        }
      } else if (calendarEvent.estadoBolo === "ensayo") {
        const hoursUntil = (startsAt.getTime() - nowMs) / 3600000;
        if (hoursUntil > 23.75 && hoursUntil <= 24) {
          jobs.push({ key: `ensayo-24h-${eventId}`, userIds: null, payload: {
            title: "Mañana hay ensayo",
            body: `${calendarEvent.fecha} · ${calendarEvent.horaInicio || "hora por confirmar"} · ${calendarEvent.lugar || "lugar por confirmar"} · Repertorio: ${calendarEvent.repertorio || "por confirmar"}`.slice(0, 350),
            tag: `ensayo-24h-${eventId}`,
            url: eventUrl(eventId),
          }});
        }
      }

      // Aviso diario a las 09:00 (hora peninsular), desde D-7 hasta el día del bolo,
      // solo a miembros que aún no han guardado ninguna respuesta de disponibilidad.
      if (calendarEvent.estadoBolo === "confirmado" && Number(localNow.hour) === REMINDER_HOUR && Number(localNow.minute) < 15) {
        const daysRemaining = dateDifferenceInMadrid(now, startsAt);
        if (daysRemaining >= 0 && daysRemaining <= 7) {
          const unanswered = members.filter((member) => !member.disponibilidadBolos?.[eventId]?.estado);
          for (const member of unanswered) {
            jobs.push({ key: `disponibilidad-diaria-${eventId}-${getId(member.id)}-${localNow.year}-${localNow.month}-${localNow.day}`, userIds: [getId(member.id)], payload: {
              title: "Aún no has indicado tu disponibilidad",
              body: `Confirma si puedes asistir a ${calendarEvent.lugar || calendarEvent.titulo || "este bolo"} el ${calendarEvent.fecha}.`,
              tag: `disponibilidad-${eventId}`,
              url: eventUrl(eventId),
            }});
          }
        }
      }
    }

    if (jobs.length === 0) return;
    configurePush();
    for (const job of jobs) {
      const marker = db.collection("notification_deliveries").doc(job.key);
      const claim = await db.runTransaction(async (transaction) => {
        const existing = await transaction.get(marker);
        if (existing.exists) return false;
        transaction.create(marker, { status: "claimed", createdAt: new Date().toISOString() });
        return true;
      });
      if (!claim) continue;
      try {
        await sendPush(job.userIds, job.payload);
        await marker.set({ status: "sent", sentAt: new Date().toISOString() }, { merge: true });
      } catch (error) {
        await marker.set({ status: "failed", error: String(error), failedAt: new Date().toISOString() }, { merge: true });
        logger.error("Falló un recordatorio programado.", { key: job.key, error });
      }
    }
  },
);
