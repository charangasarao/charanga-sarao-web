const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const test = require("node:test");
const { deleteApp, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const {
  createPendingDelivery,
  getDeliveryId,
} = require("./notification-delivery-store");
const {
  isReminderDeliveryRelevant,
  getMadridDate,
  getEventReminderDedupeKey,
} = require("./notification-logic");

const emulatorTest = process.env.FIRESTORE_EMULATOR_HOST
  ? test
  : test.skip;

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForDeliveries(db, eventId, predicate) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const snapshot = await db
      .collection("push_notification_deliveries")
      .where("eventId", "==", eventId)
      .get();
    const deliveries = snapshot.docs.map((document) => document.data());
    if (predicate(deliveries)) return deliveries;
    await sleep(250);
  }
  throw new Error(`Timed out waiting for deliveries for ${eventId}`);
}

function getMadridEventTime(offsetMilliseconds) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(Date.now() + offsetMilliseconds))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return {
    fecha: `${parts.year}-${parts.month}-${parts.day}`,
    horaInicio: `${parts.hour}:${parts.minute}h`,
  };
}

async function invokeScheduledFunction(projectId, functionName) {
  const response = await fetch(
    `http://127.0.0.1:5001/${projectId}/us-central1/${functionName}-0`,
    { method: "POST" },
  );
  const responseBody = await response.text();
  assert.equal(
    response.ok,
    true,
    `${functionName} emulator request failed: ${responseBody}`,
  );
}

emulatorTest(
  "Firestore emulator verifies event notifications, reminders, cancellation, and concurrent deduplication",
  async (t) => {
    const projectId = process.env.GCLOUD_PROJECT || "";
    assert.match(
      projectId,
      /^demo-/,
      "Integration tests must use a Firebase demo project.",
    );

    const app = initializeApp(
      { projectId },
      `notification-emulator-${crypto.randomUUID()}`,
    );
    const db = getFirestore(app);
    const calendarRef = db.doc("charanga/datos_generales");
    const userId = `notification-test-${crypto.randomUUID()}`;
    const maybeUserId = `notification-test-maybe-${crypto.randomUUID()}`;
    const noUserId = `notification-test-no-${crypto.randomUUID()}`;
    const boloId = `bolo-${crypto.randomUUID()}`;
    const ensayoId = `ensayo-${crypto.randomUUID()}`;
    const reminderBoloId = `reminder-bolo-${crypto.randomUUID()}`;
    const reminderEnsayoId = `reminder-ensayo-${crypto.randomUUID()}`;
    const availabilityBoloId = `availability-bolo-${crypto.randomUUID()}`;
    const concurrencyDeliveryId = getDeliveryId(
      `integration-concurrency:${crypto.randomUUID()}`,
    );
    const deliveryCollection = db.collection("push_notification_deliveries");
    const cleanupDeliveryRefs = [
      deliveryCollection.doc(concurrencyDeliveryId),
    ];
    const subscriptionRef = db
      .collection("push_subscriptions")
      .doc(crypto.randomUUID());

    t.after(async () => {
      await Promise.all([
        calendarRef.delete(),
        subscriptionRef.delete(),
        ...cleanupDeliveryRefs.map((reference) => reference.delete()),
        ...[
          boloId,
          ensayoId,
          reminderBoloId,
          reminderEnsayoId,
          availabilityBoloId,
        ].map(async (eventId) => {
          const snapshot = await deliveryCollection
            .where("eventId", "==", eventId)
            .get();
          await Promise.all(snapshot.docs.map((document) => document.ref.delete()));
        }),
      ]);
      await deleteApp(app);
    });

    await subscriptionRef.set({
      userId,
      subscription: { endpoint: "https://emulator.invalid/push" },
    });
    await calendarRef.set({
      miembros: [
        {
          id: userId,
          nombre: "Miembro de prueba",
          disponibilidadBolos: { [boloId]: { estado: "puedo" } },
        },
      ],
      bolos: [],
    });

    const bolo = {
      id: boloId,
      titulo: "Bolo de prueba",
      lugar: "Local de prueba",
      fecha: "2099-08-15",
      horaInicio: "13:00h",
      horaFin: "17:00h",
      vestuario: "Negro",
      estadoBolo: "confirmado",
      cochesAsignados: [],
    };
    const ensayo = {
      id: ensayoId,
      titulo: "Ensayo de prueba",
      lugar: "Sala de prueba",
      fecha: "2099-08-16",
      horaInicio: "18:00h",
      estadoBolo: "ensayo",
    };
    await calendarRef.update({ bolos: [bolo, ensayo] });

    const createdBoloDeliveries = await waitForDeliveries(
      db,
      boloId,
      (deliveries) =>
        deliveries.some(
          (delivery) => delivery.payload?.title === "Nuevo bolo en el calendario",
        ),
    );
    assert.ok(
      createdBoloDeliveries.some(
        (delivery) => delivery.payload?.title === "Nuevo bolo en el calendario",
      ),
    );
    const createdEnsayoDeliveries = await waitForDeliveries(
      db,
      ensayoId,
      (deliveries) =>
        deliveries.some(
          (delivery) =>
            delivery.payload?.title === "Nuevo ensayo en el calendario",
        ),
    );
    const ensayoNotice = createdEnsayoDeliveries.find(
      (delivery) =>
        delivery.payload?.title === "Nuevo ensayo en el calendario",
    );
    assert.match(ensayoNotice.payload.body, /Sala de prueba/);
    assert.match(ensayoNotice.payload.body, /16\/08\/2099/);
    assert.match(ensayoNotice.payload.body, /18:00h/);

    const changedBolo = {
      ...bolo,
      fecha: "2099-08-17",
      horaInicio: "14:00h",
      vestuario: "Blanco",
      cochesAsignados: [{ id: "route-test", conductor: "Miembro de prueba" }],
    };
    await calendarRef.update({ bolos: [changedBolo, ensayo] });
    const changedDeliveries = await waitForDeliveries(
      db,
      boloId,
      (deliveries) =>
        ["Cambio de horario", "Cambio de vestuario", "Nueva ruta publicada"]
          .every((title) =>
            deliveries.some((delivery) => delivery.payload?.title === title),
          ),
    );
    for (const title of [
      "Cambio de horario",
      "Cambio de vestuario",
      "Nueva ruta publicada",
    ]) {
      assert.ok(
        changedDeliveries.some((delivery) => delivery.payload?.title === title),
      );
    }

    const reminderRef = deliveryCollection.doc(
      getDeliveryId(`stale-reminder:${crypto.randomUUID()}`),
    );
    cleanupDeliveryRefs.push(reminderRef);
    await createPendingDelivery(db, reminderRef.id, {
      userId,
      eventId: boloId,
      payload: { title: "Recordatorio antiguo" },
      deliveryType: "bolo-48h",
      eventDate: bolo.fecha,
      eventTime: bolo.horaInicio,
    });
    const [calendarSnapshot] = await Promise.all([calendarRef.get()]);
    const currentBolo = calendarSnapshot
      .data()
      .bolos.find((event) => event.id === boloId);
    assert.equal(
      isReminderDeliveryRelevant(
        (await reminderRef.get()).data(),
        currentBolo,
        calendarSnapshot.data().miembros[0],
        getMadridDate(new Date()),
        new Date(),
      ),
      false,
      "A reminder for an old date/time must be rejected.",
    );

    await calendarRef.update({ bolos: [ensayo] });
    const cancelledDeliveries = await waitForDeliveries(
      db,
      boloId,
      (deliveries) =>
        deliveries.some((delivery) => delivery.payload?.title === "Bolo cancelado"),
    );
    assert.ok(
      cancelledDeliveries.some(
        (delivery) => delivery.payload?.title === "Bolo cancelado",
      ),
    );
    const ensayoDeliveries = await deliveryCollection
      .where("eventId", "==", ensayoId)
      .get();
    assert.equal(
      ensayoDeliveries.docs.some(
        (document) => document.data().payload?.title === "Bolo cancelado",
      ),
      false,
      "Removing an ensayo must not be reported as a cancelled bolo.",
    );

    const concurrentCreates = await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        createPendingDelivery(db, concurrencyDeliveryId, {
          userId,
          eventId: `concurrent-${index}`,
          payload: { title: "Concurrent test" },
        }),
      ),
    );
    assert.equal(concurrentCreates.filter(Boolean).length, 1);
    const concurrentDelivery = await deliveryCollection
      .doc(concurrencyDeliveryId)
      .get();
    assert.equal(concurrentDelivery.data().status, "pending");

    await subscriptionRef.delete();
    const reminderBoloTime = getMadridEventTime(47.75 * 60 * 60 * 1000);
    const reminderEnsayoTime = getMadridEventTime(23.75 * 60 * 60 * 1000);
    const availabilityBoloTime = getMadridEventTime(5 * 24 * 60 * 60 * 1000);
    const reminderBolo = {
      id: reminderBoloId,
      titulo: "Bolo de recordatorio",
      lugar: "Plaza de prueba",
      ...reminderBoloTime,
      estadoBolo: "confirmado",
      horaFin: "18:00h",
      vestuario: "Negro",
      cochesAsignados: [],
    };
    const reminderEnsayo = {
      id: reminderEnsayoId,
      titulo: "Ensayo de recordatorio",
      lugar: "Sala de ensayo",
      ...reminderEnsayoTime,
      estadoBolo: "ensayo",
      repertorio: "Pasodobles",
    };
    const availabilityBolo = {
      id: availabilityBoloId,
      titulo: "Bolo pendiente",
      lugar: "Plaza de prueba",
      ...availabilityBoloTime,
      estadoBolo: "confirmado",
    };
    await calendarRef.update({
      miembros: [
        {
          id: userId,
          nombre: "Miembro de prueba",
          disponibilidadBolos: {
            [reminderBoloId]: { estado: "puedo" },
          },
        },
        {
          id: maybeUserId,
          nombre: "Miembro tal vez",
          disponibilidadBolos: {
            [reminderBoloId]: { estado: "tal_vez" },
            [availabilityBoloId]: { estado: "tal_vez" },
          },
        },
        {
          id: noUserId,
          nombre: "Miembro no",
          disponibilidadBolos: {
            [reminderBoloId]: { estado: "no" },
            [availabilityBoloId]: { estado: "no" },
          },
        },
      ],
      bolos: [reminderBolo, reminderEnsayo, availabilityBolo],
    });

    for (const eventId of [boloId, ensayoId]) {
      const snapshot = await deliveryCollection
        .where("eventId", "==", eventId)
        .get();
      cleanupDeliveryRefs.push(...snapshot.docs.map((document) => document.ref));
    }

    const reminderBoloDeliveryIds = [userId, maybeUserId, noUserId].map(
      (memberId) =>
        getDeliveryId(
          `${getEventReminderDedupeKey(
            "bolo-48h",
            reminderBoloId,
            reminderBolo.fecha,
            reminderBolo.horaInicio,
          )}:${memberId}`,
        ),
    );
    const reminderEnsayoDeliveryRefs = [userId, maybeUserId, noUserId].map(
      (memberId) =>
        deliveryCollection.doc(
          getDeliveryId(
            `${getEventReminderDedupeKey(
              "ensayo-24h",
              reminderEnsayoId,
              reminderEnsayo.fecha,
              reminderEnsayo.horaInicio,
            )}:${memberId}`,
          ),
        ),
    );
    const today = getMadridDate(new Date());
    const availabilityDeliveryIds = [userId, maybeUserId, noUserId].map(
      (memberId) =>
        getDeliveryId(
          `availability:${availabilityBoloId}:${today}:${memberId}`,
        ),
    );
    const expectedDeliveryRefs = [
      ...reminderBoloDeliveryIds.map((id) => deliveryCollection.doc(id)),
      ...reminderEnsayoDeliveryRefs,
      ...availabilityDeliveryIds.map((id) => deliveryCollection.doc(id)),
    ];
    cleanupDeliveryRefs.push(...expectedDeliveryRefs);

    await invokeScheduledFunction(projectId, "sendScheduledNotifications");
    await invokeScheduledFunction(projectId, "sendScheduledNotifications");
    for (const deliveryId of reminderBoloDeliveryIds) {
      const delivery = await deliveryCollection.doc(deliveryId).get();
      if (deliveryId === reminderBoloDeliveryIds[0]) {
        assert.equal(delivery.data()?.status, "sent");
      } else {
        assert.equal(delivery.exists, false);
      }
    }
    for (const deliveryRef of reminderEnsayoDeliveryRefs) {
      assert.equal((await deliveryRef.get()).data()?.status, "sent");
    }

    await invokeScheduledFunction(projectId, "sendAvailabilityReminders");
    await invokeScheduledFunction(projectId, "sendAvailabilityReminders");
    assert.equal(
      (await deliveryCollection.doc(availabilityDeliveryIds[0]).get()).data()
        ?.status,
      "sent",
    );
    assert.equal(
      (await deliveryCollection.doc(availabilityDeliveryIds[1]).get()).exists,
      false,
    );
    assert.equal(
      (await deliveryCollection.doc(availabilityDeliveryIds[2]).get()).exists,
      false,
    );
    assert.equal(
      (
        await deliveryCollection
          .where("eventId", "==", availabilityBoloId)
          .get()
      ).size,
      0,
      "Delivery records must not retain event IDs after successful processing.",
    );
  },
);
