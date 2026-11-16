const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const webpush = require("web-push");

initializeApp();

const vapidPublicKey = defineSecret("VAPID_PUBLIC_KEY");
const vapidPrivateKey = defineSecret("VAPID_PRIVATE_KEY");
const vapidSubject = defineSecret("VAPID_SUBJECT");
const db = getFirestore();

const EVENT_STATES = new Set(["confirmado", "ensayo"]);

function getId(value) {
  return value == null ? "" : String(value);
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
    return snapshot.docs.filter(
      (subscription) => !subscription.data().disabled,
    );
  }

  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  const snapshots = await Promise.all(
    Array.from({ length: Math.ceil(uniqueIds.length / 30) }, (_, index) =>
      subscriptions
        .where("userId", "in", uniqueIds.slice(index * 30, (index + 1) * 30))
        .get(),
    ),
  );
  return snapshots
    .flatMap((snapshot) => snapshot.docs)
    .filter((subscription) => !subscription.data().disabled);
}

async function sendPush(userIds, notification) {
  const subscriptions = await getSubscriptions(userIds);
  await Promise.all(
    subscriptions.map(async (subscriptionDocument) => {
      const subscription = subscriptionDocument.data().subscription;
      if (!subscription) return;

      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify(notification),
        );
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          try {
            await subscriptionDocument.ref.delete();
          } catch (deleteError) {
            logger.error("No se pudo eliminar una suscripción caducada.", {
              subscriptionId: subscriptionDocument.id,
              error: deleteError,
            });
          }
          return;
        }
        logger.error("No se pudo enviar una notificación push.", {
          subscriptionId: subscriptionDocument.id,
          error,
        });
      }
    }),
  );
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

    for (const calendarEvent of currentEvents) {
      const previousEvent = previousEvents.find(
        (candidate) => getId(candidate.id) === getId(calendarEvent.id),
      );
      const wasOnCalendar = EVENT_STATES.has(previousEvent?.estadoBolo);
      const isOnCalendar = EVENT_STATES.has(calendarEvent.estadoBolo);

      if (isOnCalendar && !wasOnCalendar) {
        notifications.push({
          userIds: null,
          payload: {
            title:
              calendarEvent.estadoBolo === "ensayo"
                ? "Nuevo ensayo en el calendario"
                : "Nuevo bolo en el calendario",
            body:
              calendarEvent.estadoBolo === "ensayo"
                ? "Tenemos nuevo ENSAYO fijado panzabucheeee"
                : "Tenemos nuevo BOLO croquetoooooo",
            tag: `evento-${getId(calendarEvent.id)}`,
            url: `/?evento=${encodeURIComponent(getId(calendarEvent.id))}`,
          },
        });
      }

      if (!previousEvent || !calendarEvent.id) continue;
      const newRoutes = getNewRoutes(previousEvent, calendarEvent);
      if (newRoutes.length === 0) continue;

      const attendingMemberIds = (currentData.miembros || [])
        .filter(
          (member) =>
            member.disponibilidadBolos?.[getId(calendarEvent.id)]?.estado ===
            "puedo",
        )
        .map((member) => getId(member.id));

      for (const route of newRoutes) {
        notifications.push({
          userIds: attendingMemberIds,
          payload: {
            title: "Nueva ruta para un bolo al que estás apuntado",
            body: `${route.creadoPor || route.conductor || "Alguien"} ha puesto su putivuelta para este bolo`,
            tag: `ruta-${getId(calendarEvent.id)}-${getId(route.id)}`,
            url: `/?evento=${encodeURIComponent(getId(calendarEvent.id))}`,
          },
        });
      }
    }

    if (notifications.length === 0) return;

    webpush.setVapidDetails(
      vapidSubject.value(),
      vapidPublicKey.value(),
      vapidPrivateKey.value(),
    );
    await Promise.all(
      notifications.map(({ userIds, payload }) => sendPush(userIds, payload)),
    );
  },
);
