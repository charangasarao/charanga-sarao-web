const crypto = require("node:crypto");
const { initializeApp } = require("firebase-admin/app");
const {
  FieldValue,
  Timestamp,
  getFirestore,
} = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { logger } = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const webpush = require("web-push");
const {
  buildAvailabilityReminder,
  buildBoloReminder,
  buildEnsayoReminder,
  getFcmTokenGroups,
  getCalendarNotifications,
  getEventStart,
  getId,
  isEventReminderDue,
  isReminderDeliveryRelevant,
  getMemberId,
  getMadridDate,
  isPendingAvailability,
  MADRID_TIME_ZONE,
  shouldSendRouteWebPush,
} = require("./notification-logic");

initializeApp();

const vapidPublicKey = defineSecret("VAPID_PUBLIC_KEY");
const vapidPrivateKey = defineSecret("VAPID_PRIVATE_KEY");
const vapidSubject = defineSecret("VAPID_SUBJECT");
const db = getFirestore();

const DELIVERY_COLLECTION = "push_notification_deliveries";
const DELIVERY_BATCH_SIZE = 100;
const DELIVERY_LEASE_MS = 15 * 60 * 1000;
const FCM_TOKEN_COLLECTION = "tokens_notificaciones";

function getDeliveryId(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isAlreadyExists(error) {
  return (
    error?.code === 6 ||
    error?.code === "already-exists" ||
    error?.code === "ALREADY_EXISTS"
  );
}

async function getSubscriptions(userId) {
  const subscriptions = await db
    .collection("push_subscriptions")
    .where("userId", "==", userId)
    .get();
  return subscriptions.docs.filter(
    (document) => !document.data().disabled && document.data().subscription,
  );
}

async function createPendingDelivery(deliveryId, deliveryData) {
  const deliveryRef = db.collection(DELIVERY_COLLECTION).doc(deliveryId);
  try {
    await deliveryRef.create({
      ...deliveryData,
      status: "pending",
      attemptCount: 0,
      deliveredSubscriptionIds: [],
      nextAttemptAt: Timestamp.fromMillis(0),
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    if (isAlreadyExists(error)) return;
    throw error;
  }
}

async function enqueueNotification({
  dedupeKey,
  userId,
  eventId,
  payload,
  deliveryType,
  eventDate,
  eventTime,
  reminderDate,
  excludeFcmDuplicates,
}) {
  if (!userId) return;

  const deliveryId = getDeliveryId(`${dedupeKey}:${userId}`);
  await createPendingDelivery(deliveryId, {
    userId,
    eventId: getId(eventId),
    payload,
    ...(deliveryType
      ? { deliveryType, eventDate, eventTime, reminderDate }
      : {}),
    ...(excludeFcmDuplicates ? { excludeFcmDuplicates: true } : {}),
  });
}

async function enqueueForRecipients({
  dedupeKey,
  eventId,
  payload,
  recipientIds,
  excludeFcmDuplicates,
}) {
  let userIds = recipientIds;
  if (userIds === null) {
    const subscriptions = await db.collection("push_subscriptions").get();
    userIds = [
      ...new Set(
        subscriptions.docs
          .filter(
            (document) =>
              !document.data().disabled && document.data().subscription,
          )
          .map((document) => getId(document.data().userId))
          .filter(Boolean),
      ),
    ];
  }

  await Promise.all(
    [...new Set(userIds)].map((userId) =>
      enqueueNotification({
        dedupeKey,
        userId,
        eventId,
        payload,
        excludeFcmDuplicates,
      }),
    ),
  );
}

async function enqueueFcmRouteNotifications({ dedupeKey, eventId, payload }) {
  const snapshot = await db.collection(FCM_TOKEN_COLLECTION).get();
  const tokens = getFcmTokenGroups(
    snapshot.docs.map((document) => ({
      id: document.id,
      token: document.data().token,
    })),
  );

  await Promise.all(
    tokens.map(({ token, documentIds }) =>
      createPendingDelivery(
        getDeliveryId(`${dedupeKey}:fcm:${getDeliveryId(token)}`),
        {
          eventId: getId(eventId),
          payload,
          fcmTokenDocumentIds: documentIds,
          fcmTokenHash: getDeliveryId(token),
        },
      ),
    ),
  );
}

async function enqueueCalendarChanges(cloudEventId, previousData, currentData) {
  const notifications = getCalendarNotifications(previousData, currentData);
  await Promise.all(
    notifications.map(async ({ kind, eventId, recipientIds, payload }) => {
      const dedupeKey = `calendar:${cloudEventId}:${kind}:${eventId}`;
      const isNewRoute = kind.startsWith("nueva-ruta-");
      await Promise.all([
        enqueueForRecipients({
          dedupeKey,
          eventId,
          payload,
          recipientIds,
          excludeFcmDuplicates: isNewRoute,
        }),
        ...(isNewRoute
          ? [enqueueFcmRouteNotifications({ dedupeKey, eventId, payload })]
          : []),
      ]);
    }),
  );
}

function getScheduledTime(event) {
  const scheduledTime = new Date(event.scheduleTime);
  return Number.isNaN(scheduledTime.getTime()) ? new Date() : scheduledTime;
}

function configureWebPush() {
  webpush.setVapidDetails(
    vapidSubject.value(),
    vapidPublicKey.value(),
    vapidPrivateKey.value(),
  );
}

function getRetryDelay(attemptCount) {
  return Math.min(
    60 * 60 * 1000,
    30 * 1000 * 2 ** Math.min(attemptCount - 1, 7),
  );
}

async function claimDelivery(deliveryRef, now) {
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(deliveryRef);
    if (!snapshot.exists) return null;

    const delivery = snapshot.data();
    const nextAttemptAt = delivery.nextAttemptAt?.toDate?.();
    if (
      delivery.status === "sent" ||
      !nextAttemptAt ||
      nextAttemptAt.getTime() > now.getTime()
    ) {
      return null;
    }

    const leaseId = crypto.randomUUID();
    const attemptCount = (delivery.attemptCount || 0) + 1;
    transaction.update(deliveryRef, {
      status: "sending",
      attemptCount,
      leaseId,
      nextAttemptAt: Timestamp.fromDate(
        new Date(now.getTime() + DELIVERY_LEASE_MS),
      ),
    });
    return {
      ...delivery,
      attemptCount,
      deliveredSubscriptionIds: delivery.deliveredSubscriptionIds || [],
      leaseId,
    };
  });
}

async function recordDeliveryRetry(deliveryRef, leaseId, attemptCount, error) {
  const now = new Date();
  try {
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(deliveryRef);
      if (!snapshot.exists) return;
      const delivery = snapshot.data();
      if (delivery.status === "sent" || delivery.leaseId !== leaseId) return;

      transaction.update(deliveryRef, {
        status: "pending",
        nextAttemptAt: Timestamp.fromDate(
          new Date(now.getTime() + getRetryDelay(attemptCount)),
        ),
        lastError: String(error?.message || error).slice(0, 1000),
        leaseId: FieldValue.delete(),
      });
    });
  } catch (recordError) {
    logger.error("No se pudo programar el reintento de una notificación.", {
      deliveryId: deliveryRef.id,
      error: recordError,
    });
  }
}

async function markSubscriptionDelivered(deliveryRef, subscriptionId) {
  await deliveryRef.update({
    deliveredSubscriptionIds: FieldValue.arrayUnion(subscriptionId),
  });
}

async function markDeliverySent(deliveryRef, leaseId) {
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(deliveryRef);
    if (!snapshot.exists) return;
    const delivery = snapshot.data();
    if (delivery.status !== "sending" || delivery.leaseId !== leaseId) return;

    transaction.update(deliveryRef, {
      status: "sent",
      sentAt: FieldValue.serverTimestamp(),
      nextAttemptAt: FieldValue.delete(),
      userId: FieldValue.delete(),
      eventId: FieldValue.delete(),
      payload: FieldValue.delete(),
      deliveredSubscriptionIds: FieldValue.delete(),
      deliveryType: FieldValue.delete(),
      eventDate: FieldValue.delete(),
      eventTime: FieldValue.delete(),
      reminderDate: FieldValue.delete(),
      excludeFcmDuplicates: FieldValue.delete(),
      fcmTokenDocumentIds: FieldValue.delete(),
      fcmTokenHash: FieldValue.delete(),
      lastError: FieldValue.delete(),
      leaseId: FieldValue.delete(),
    });
  });
}

async function getValidFcmDevices(userId) {
  const snapshot = await db
    .collection(FCM_TOKEN_COLLECTION)
    .where("userId", "==", userId)
    .get();
  return snapshot.docs
    .map((document) => {
      const token = document.data().token;
      return typeof token === "string" && token.trim()
        ? {
            pushSubscriptionId: document.data().pushSubscriptionId,
            userId: getId(document.data().userId),
            token: token.trim(),
          }
        : null;
    })
    .filter(Boolean);
}

async function processDelivery(deliveryDocument, now) {
  const deliveryRef = deliveryDocument.ref;
  let delivery;
  try {
    delivery = await claimDelivery(deliveryRef, now);
    if (!delivery) return;

    let payload = delivery.payload;
    if (delivery.deliveryType) {
      const calendarSnapshot = await db.doc("charanga/datos_generales").get();
      const calendarData = calendarSnapshot.exists
        ? calendarSnapshot.data()
        : {};
      const calendarEvent = (
        Array.isArray(calendarData.bolos) ? calendarData.bolos : []
      ).find((candidate) => getId(candidate.id) === delivery.eventId);
      const member = (
        Array.isArray(calendarData.miembros) ? calendarData.miembros : []
      ).find((candidate) => getMemberId(candidate) === delivery.userId);
      const today = getMadridDate(new Date());
      if (
        !isReminderDeliveryRelevant(
          delivery,
          calendarEvent,
          member,
          today,
          new Date(),
        )
      ) {
        await markDeliverySent(deliveryRef, delivery.leaseId);
        return;
      }

      if (delivery.deliveryType === "bolo-48h") {
        payload = buildBoloReminder(calendarEvent, member);
      } else if (delivery.deliveryType === "ensayo-24h") {
        payload = buildEnsayoReminder(calendarEvent);
      } else if (delivery.deliveryType === "availability") {
        payload = buildAvailabilityReminder(calendarEvent);
      }
    }

    if (Array.isArray(delivery.fcmTokenDocumentIds)) {
      const tokenDocuments = await Promise.all(
        delivery.fcmTokenDocumentIds.map((documentId) =>
          db.collection(FCM_TOKEN_COLLECTION).doc(documentId).get(),
        ),
      );
      const token = tokenDocuments
        .filter((document) => document.exists)
        .map((document) => document.data().token)
        .find(
          (candidate) =>
            typeof candidate === "string" &&
            candidate.trim() &&
            getDeliveryId(candidate.trim()) === delivery.fcmTokenHash,
        );

      if (!token) {
        logger.warn("El token FCM de una ruta ya no está disponible.", {
          deliveryId: deliveryRef.id,
        });
        await markDeliverySent(deliveryRef, delivery.leaseId);
        return;
      }

      await getMessaging().send({
        token: token.trim(),
        notification: {
          title: payload.title,
          body: payload.body,
        },
        webpush: {
          notification: {
            icon: "/PEGATINAS-512.png",
            badge: "/PEGATINAS-192.png",
            tag: payload.tag,
          },
        },
      });
      await markDeliverySent(deliveryRef, delivery.leaseId);
      return;
    }

    const subscriptions = await getSubscriptions(delivery.userId);
    const fcmDevices = delivery.excludeFcmDuplicates
      ? await getValidFcmDevices(delivery.userId)
      : [];
    const deliveredIds = new Set(delivery.deliveredSubscriptionIds);
    let hasFailures = false;

    for (const subscriptionDocument of subscriptions) {
      if (deliveredIds.has(subscriptionDocument.id)) continue;
      if (
        delivery.excludeFcmDuplicates &&
        !shouldSendRouteWebPush(
          {
            ...subscriptionDocument.data(),
            subscriptionId: subscriptionDocument.id,
          },
          fcmDevices,
        )
      ) {
        await markSubscriptionDelivered(deliveryRef, subscriptionDocument.id);
        deliveredIds.add(subscriptionDocument.id);
        continue;
      }

      try {
        await webpush.sendNotification(
          subscriptionDocument.data().subscription,
          JSON.stringify(payload),
        );
        await markSubscriptionDelivered(deliveryRef, subscriptionDocument.id);
        deliveredIds.add(subscriptionDocument.id);
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
          await markSubscriptionDelivered(deliveryRef, subscriptionDocument.id);
          deliveredIds.add(subscriptionDocument.id);
          continue;
        }

        hasFailures = true;
        logger.error("No se pudo enviar una notificación push.", {
          deliveryId: deliveryRef.id,
          subscriptionId: subscriptionDocument.id,
          error,
        });
      }
    }

    if (hasFailures) {
      await recordDeliveryRetry(
        deliveryRef,
        delivery.leaseId,
        delivery.attemptCount,
        new Error("Falló el envío a una o más suscripciones push."),
      );
      return;
    }

    await markDeliverySent(deliveryRef, delivery.leaseId);
  } catch (error) {
    logger.error("Falló el procesamiento de una notificación push.", {
      deliveryId: deliveryRef.id,
      error,
    });
    if (delivery) {
      await recordDeliveryRetry(
        deliveryRef,
        delivery.leaseId,
        delivery.attemptCount,
        error,
      );
    }
  }
}

async function processDueDeliveries(now) {
  const dueDeliveries = await db
    .collection(DELIVERY_COLLECTION)
    .where("nextAttemptAt", "<=", Timestamp.fromDate(now))
    .orderBy("nextAttemptAt")
    .limit(DELIVERY_BATCH_SIZE)
    .get();

  await Promise.all(
    dueDeliveries.docs.map((document) => processDelivery(document, now)),
  );
}

async function queueAvailabilityReminders(calendarData, scheduledTime) {
  const today = getMadridDate(scheduledTime);
  const members = Array.isArray(calendarData.miembros)
    ? calendarData.miembros
    : [];
  const events = Array.isArray(calendarData.bolos) ? calendarData.bolos : [];
  const enqueueTasks = [];

  for (const calendarEvent of events) {
    if (calendarEvent.estadoBolo !== "confirmado") continue;
    const eventId = getId(calendarEvent.id);
    if (!eventId) continue;

    for (const member of members) {
      if (!isPendingAvailability(calendarEvent, member, today)) continue;
      const userId = getMemberId(member);
      if (!userId) continue;

      enqueueTasks.push(
        enqueueNotification({
          dedupeKey: `availability:${eventId}:${today}`,
          userId,
          eventId,
          payload: buildAvailabilityReminder(calendarEvent),
          deliveryType: "availability",
          eventDate: calendarEvent.fecha,
          reminderDate: today,
        }),
      );
    }
  }

  const results = await Promise.allSettled(enqueueTasks);
  let hasFailures = false;
  for (const result of results) {
    if (result.status === "rejected") {
      hasFailures = true;
      logger.error("No se pudo encolar un recordatorio de disponibilidad.", {
        error: result.reason,
      });
    }
  }
  if (hasFailures) {
    throw new Error(
      "No se pudieron encolar todos los recordatorios de disponibilidad.",
    );
  }
}

async function queueTimedEventReminders(calendarData, scheduledTime) {
  const members = Array.isArray(calendarData.miembros)
    ? calendarData.miembros
    : [];
  const events = Array.isArray(calendarData.bolos) ? calendarData.bolos : [];
  const enqueueTasks = [];

  for (const calendarEvent of events) {
    const eventId = getId(calendarEvent.id);
    if (!eventId) continue;

    const eventStart = getEventStart(calendarEvent);
    if (!eventStart) {
      if (
        scheduledTime.getUTCMinutes() === 0 &&
        (calendarEvent.estadoBolo === "confirmado" ||
          calendarEvent.estadoBolo === "ensayo")
      ) {
        logger.warn(
          "No se pudo programar un recordatorio: fecha u hora no válida.",
          {
            eventId,
          },
        );
      }
      continue;
    }

    if (calendarEvent.estadoBolo === "confirmado") {
      if (isEventReminderDue(calendarEvent, 48, scheduledTime)) {
        for (const member of members) {
          if (member?.disponibilidadBolos?.[eventId]?.estado !== "puedo") {
            continue;
          }
          const userId = getMemberId(member);
          if (!userId) continue;

          enqueueTasks.push(
            enqueueNotification({
              dedupeKey: `bolo-48h:${eventId}`,
              userId,
              eventId,
              payload: buildBoloReminder(calendarEvent, member),
              deliveryType: "bolo-48h",
              eventDate: calendarEvent.fecha,
              eventTime: calendarEvent.horaInicio,
            }),
          );
        }
      }
    }

    if (calendarEvent.estadoBolo === "ensayo") {
      if (isEventReminderDue(calendarEvent, 24, scheduledTime)) {
        for (const member of members) {
          const userId = getMemberId(member);
          if (!userId) continue;

          enqueueTasks.push(
            enqueueNotification({
              dedupeKey: `ensayo-24h:${eventId}`,
              userId,
              eventId,
              payload: buildEnsayoReminder(calendarEvent),
              deliveryType: "ensayo-24h",
              eventDate: calendarEvent.fecha,
              eventTime: calendarEvent.horaInicio,
            }),
          );
        }
      }
    }
  }

  const results = await Promise.allSettled(enqueueTasks);
  let hasFailures = false;
  for (const result of results) {
    if (result.status === "rejected") {
      hasFailures = true;
      logger.error("No se pudo encolar un recordatorio de evento.", {
        error: result.reason,
      });
    }
  }
  if (hasFailures) {
    throw new Error(
      "No se pudieron encolar todos los recordatorios de evento.",
    );
  }
}

exports.notifyOnCalendarChanges = onDocumentUpdated(
  {
    document: "charanga/datos_generales",
    retry: true,
  },
  async (event) => {
    const previousData = event.data?.before.data();
    const currentData = event.data?.after.data();
    if (!previousData || !currentData) return;

    await enqueueCalendarChanges(event.id, previousData, currentData);
  },
);

exports.sendScheduledNotifications = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: MADRID_TIME_ZONE,
    retryCount: 3,
    maxRetrySeconds: 600,
    minBackoffSeconds: 10,
    maxInstances: 1,
    concurrency: 1,
    timeoutSeconds: 540,
    secrets: [vapidPublicKey, vapidPrivateKey, vapidSubject],
  },
  async (event) => {
    const scheduledTime = getScheduledTime(event);
    const calendarSnapshot = await db.doc("charanga/datos_generales").get();
    if (calendarSnapshot.exists) {
      const calendarData = calendarSnapshot.data();
      await queueTimedEventReminders(calendarData, scheduledTime);
    }

    configureWebPush();
    await processDueDeliveries(new Date());
  },
);

exports.sendAvailabilityReminders = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: MADRID_TIME_ZONE,
    retryCount: 3,
    maxRetrySeconds: 1800,
    minBackoffSeconds: 30,
    maxInstances: 1,
    concurrency: 1,
    timeoutSeconds: 540,
    secrets: [vapidPublicKey, vapidPrivateKey, vapidSubject],
  },
  async (event) => {
    const scheduledTime = getScheduledTime(event);
    const calendarSnapshot = await db.doc("charanga/datos_generales").get();
    if (calendarSnapshot.exists) {
      await queueAvailabilityReminders(calendarSnapshot.data(), scheduledTime);
    }

    configureWebPush();
    await processDueDeliveries(new Date());
  },
);
