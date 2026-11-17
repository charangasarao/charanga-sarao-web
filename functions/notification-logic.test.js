const assert = require("node:assert/strict");
const test = require("node:test");
const {
  buildAvailabilityReminder,
  buildBoloReminder,
  buildEnsayoReminder,
  getFcmTokenGroups,
  getCalendarNotifications,
  getEventStart,
  isEventReminderDue,
  isPendingAvailability,
  isReminderDeliveryRelevant,
  shouldSendRouteWebPush,
} = require("./notification-logic");

function confirmedEvent(overrides = {}) {
  return {
    id: 12,
    titulo: "Pasacalles",
    lugar: "Cuéllar",
    fecha: "2027-08-15",
    horaInicio: "13:00h",
    horaFin: "17:00h",
    vestuario: "Negro",
    estadoBolo: "confirmado",
    cochesAsignados: [],
    ...overrides,
  };
}

test("notifica cambios de fecha, horas y vestuario solo para bolos confirmados", () => {
  const previousEvent = confirmedEvent();
  const currentEvent = confirmedEvent({
    fecha: "2027-08-16",
    horaInicio: "14:00h",
    horaFin: "18:00h",
    vestuario: "Blanco",
  });
  const notifications = getCalendarNotifications(
    { bolos: [previousEvent], miembros: [] },
    {
      bolos: [currentEvent],
      miembros: [{ id: 8, nombre: "Músico" }],
    },
  );

  assert.deepEqual(
    notifications.map((notification) => notification.kind),
    ["cambio-horario", "cambio-vestuario"],
  );
  assert.match(notifications[0].payload.body, /15\/08\/2027, 13:00h - 17:00h/);
  assert.match(notifications[0].payload.body, /16\/08\/2027, 14:00h - 18:00h/);
  assert.match(
    notifications[1].payload.body,
    /Camiseta Negra → Camiseta Blanca/,
  );
  assert.equal(notifications[0].payload.tag, "evento-12-cambio-horario");
  assert.equal(notifications[1].payload.tag, "evento-12-cambio-vestuario");
  assert.notEqual(notifications[0].payload.tag, notifications[1].payload.tag);
  assert.deepEqual(notifications[0].recipientIds, ["8"]);

  const budgetedNotifications = getCalendarNotifications(
    { bolos: [{ ...previousEvent, estadoBolo: "presupuestado" }] },
    {
      bolos: [{ ...currentEvent, estadoBolo: "presupuestado" }],
      miembros: [],
    },
  );
  assert.equal(budgetedNotifications.length, 0);
});

test("cancelar un bolo confirmado avisa, pero eliminar un ensayo no", () => {
  const bolo = confirmedEvent();
  const ensayo = confirmedEvent({ id: 13, estadoBolo: "ensayo" });
  const notifications = getCalendarNotifications(
    { bolos: [bolo, ensayo], miembros: [] },
    { bolos: [], miembros: [{ id: 1, nombre: "Sara" }] },
  );

  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].payload.title, "Bolo cancelado");
  assert.match(notifications[0].payload.body, /Pasacalles/);
  assert.match(notifications[0].payload.body, /15\/08\/2027/);
});

test("conserva los avisos de alta y notifica rutas a todos los registrados", () => {
  const bolo = confirmedEvent({ id: 20 });
  const ensayo = confirmedEvent({
    id: 21,
    titulo: "Ensayo",
    estadoBolo: "ensayo",
  });
  const newEvents = getCalendarNotifications(
    { bolos: [], miembros: [] },
    { bolos: [bolo, ensayo], miembros: [] },
  );
  assert.deepEqual(
    newEvents.map((notification) => notification.payload.title),
    ["Nuevo bolo en el calendario", "Nuevo ensayo en el calendario"],
  );
  assert.match(newEvents[1].payload.body, /Cuéllar/);
  assert.match(newEvents[1].payload.body, /15\/08\/2027/);
  assert.match(newEvents[1].payload.body, /13:00h/);
  assert.match(newEvents[1].payload.body, /panzabucheeee/);

  const previousEvent = confirmedEvent({ id: 22 });
  const currentEvent = confirmedEvent({
    id: 22,
    cochesAsignados: [{ id: 90, conductor: "Ana", creadoPor: "Ana" }],
  });
  const routeNotifications = getCalendarNotifications(
    { bolos: [previousEvent] },
    {
      bolos: [currentEvent],
      miembros: [
        {
          id: 1,
          disponibilidadBolos: { 22: { estado: "puedo" } },
        },
        {
          id: 2,
          disponibilidadBolos: { 22: { estado: "tal_vez" } },
        },
        {
          id: 3,
          disponibilidadBolos: { 22: { estado: "no" } },
        },
        { id: 4, disponibilidadBolos: {} },
      ],
    },
  );
  assert.equal(routeNotifications.length, 1);
  assert.equal(routeNotifications[0].payload.title, "Nueva ruta publicada");
  assert.match(routeNotifications[0].payload.body, /Cuéllar/);
  assert.equal(routeNotifications[0].recipientIds, null);
});

test("deduplica tokens FCM repetidos y omite tokens vacíos", () => {
  const groups = getFcmTokenGroups([
    { id: "device-a", token: " token-a " },
    { id: "device-b", token: "token-a" },
    { id: "device-c", token: "token-c" },
    { id: "device-empty", token: " " },
    { id: "device-missing" },
  ]);

  assert.deepEqual(groups, [
    { token: "token-a", documentIds: ["device-a", "device-b"] },
    { token: "token-c", documentIds: ["device-c"] },
  ]);
});

test("evita Web Push duplicado si la misma persona ya recibe la ruta por FCM", () => {
  const fcmDevices = [
    {
      pushSubscriptionId: "subscription-a",
      userId: "1",
      token: "token-a",
    },
    {
      pushSubscriptionId: "subscription-b",
      userId: "1",
      token: "token-b",
    },
  ];

  assert.equal(
    shouldSendRouteWebPush(
      { userId: "1", subscriptionId: "subscription-a" },
      fcmDevices,
    ),
    false,
  );
  assert.equal(
    shouldSendRouteWebPush(
      { userId: "1", subscriptionId: "subscription-c" },
      fcmDevices,
    ),
    true,
  );
  assert.equal(shouldSendRouteWebPush({ userId: "1" }, fcmDevices), false);
  assert.equal(shouldSendRouteWebPush({ userId: "2" }, fcmDevices), true);
  assert.equal(
    shouldSendRouteWebPush(
      { userId: "1", subscriptionId: "legacy-subscription" },
      [{ userId: "1", token: "legacy-token" }],
    ),
    false,
  );
});

test("solo avisa de disponibilidad pendiente en los siete días anteriores y el mismo día", () => {
  const event = confirmedEvent({ id: "bolo-1", fecha: "2027-08-15" });
  const member = { id: 1 };
  const pending = { id: 1, disponibilidadBolos: {} };

  assert.equal(isPendingAvailability(event, pending, "2027-08-08"), true);
  assert.equal(isPendingAvailability(event, pending, "2027-08-15"), true);
  assert.equal(isPendingAvailability(event, pending, "2027-08-07"), false);
  assert.equal(isPendingAvailability(event, pending, "2027-08-16"), false);

  for (const state of ["puedo", "no", "tal_vez"]) {
    assert.equal(
      isPendingAvailability(
        event,
        { ...member, disponibilidadBolos: { "bolo-1": { estado: state } } },
        "2027-08-10",
      ),
      false,
    );
  }
  assert.equal(
    isPendingAvailability(
      event,
      { ...member, disponibilidadBolos: { "bolo-1": {} } },
      "2027-08-10",
    ),
    true,
  );
  assert.match(buildAvailabilityReminder(event).body, /Pasacalles/);
});

test("construye el recordatorio con la ruta propia y su punto de recogida", () => {
  const event = confirmedEvent({
    cochesAsignados: [
      {
        id: "car-a",
        conductor: "Ana",
        pasajeros: ["Luis"],
        origen: "Segovia",
        horaSalida: "10:00h",
        paradas: [{ lugar: "La Granja", hora: "10:30h" }],
        destino: "Cuéllar",
        horaLlegada: "12:00h",
        recogidasPasajeros: { luis: "La Granja" },
      },
      {
        id: "car-b",
        conductor: "Eva",
        pasajeros: ["Marta"],
        origen: "Madrid",
        destino: "Cuéllar",
      },
    ],
  });
  const reminder = buildBoloReminder(event, { nombre: "Luis" });

  assert.match(reminder.body, /Conductor/);
  assert.match(reminder.body, /Ana/);
  assert.match(reminder.body, /Segovia/);
  assert.match(reminder.body, /10:00h/);
  assert.match(reminder.body, /La Granja 10:30h/);
  assert.match(reminder.body, /Cuéllar/);
  assert.match(reminder.body, /12:00h/);
  assert.match(reminder.body, /Tu punto de recogida: La Granja/);
  assert.doesNotMatch(reminder.body, /Madrid/);

  const noRouteReminder = buildBoloReminder(event, { nombre: "Sara" });
  assert.match(noRouteReminder.body, /No tienes una ruta de coche asignada/);
});

test("el recordatorio de ensayo incluye lugar y repertorio cuando existe", () => {
  const reminder = buildEnsayoReminder({
    id: 4,
    titulo: "Ensayo",
    lugar: "Local",
    fecha: "2027-08-15",
    horaInicio: "18:00h",
    repertorio: "Pasodobles",
  });

  assert.equal(reminder.title, "Mañana tienes ensayo");
  assert.match(reminder.body, /Local/);
  assert.match(reminder.body, /18:00h/);
  assert.match(reminder.body, /Pasodobles/);
});

test("interpreta las horas del calendario en la zona horaria de Madrid", () => {
  assert.equal(
    getEventStart({ fecha: "2027-08-15", horaInicio: "13:00h" }).toISOString(),
    "2027-08-15T11:00:00.000Z",
  );
  assert.equal(
    getEventStart({ fecha: "2027-08-15", horaInicio: "por definir" }),
    null,
  );
});

test("activa los recordatorios de bolo y ensayo en el minuto exacto previsto", () => {
  const event = confirmedEvent({ fecha: "2027-08-15", horaInicio: "13:00h" });
  const boloReminderTime = new Date("2027-08-13T11:00:00.000Z");
  const ensayo = { ...event, estadoBolo: "ensayo" };

  assert.equal(isEventReminderDue(event, 48, boloReminderTime), true);
  assert.equal(
    isEventReminderDue(event, 48, new Date("2027-08-13T11:01:00.000Z")),
    false,
  );
  assert.equal(
    isEventReminderDue(event, 48, new Date("2027-08-13T10:59:59.000Z")),
    false,
  );
  assert.equal(
    isEventReminderDue(ensayo, 24, new Date("2027-08-14T11:00:00.000Z")),
    true,
  );
  assert.equal(
    isEventReminderDue(
      { ...event, fecha: "2027-08-15", horaInicio: "incompleta" },
      48,
      boloReminderTime,
    ),
    false,
  );
});

test("vuelve a validar disponibilidad antes del envío para detener avisos en cola", () => {
  const event = confirmedEvent({ id: "bolo-1" });
  const member = { id: 1, disponibilidadBolos: {} };
  const delivery = {
    deliveryType: "availability",
    eventDate: event.fecha,
    reminderDate: "2027-08-08",
  };

  assert.equal(
    isReminderDeliveryRelevant(
      delivery,
      event,
      member,
      "2027-08-08",
      new Date("2027-08-08T07:00:00.000Z"),
    ),
    true,
  );
  for (const state of ["puedo", "no", "tal_vez"]) {
    assert.equal(
      isReminderDeliveryRelevant(
        delivery,
        event,
        {
          ...member,
          disponibilidadBolos: { "bolo-1": { estado: state } },
        },
        "2027-08-08",
        new Date("2027-08-08T07:00:00.000Z"),
      ),
      false,
    );
  }
  assert.equal(
    isReminderDeliveryRelevant(
      delivery,
      event,
      member,
      "2027-08-09",
      new Date("2027-08-09T07:00:00.000Z"),
    ),
    false,
  );
});

test("solo mantiene recordatorios de bolo para asistentes y eventos todavía vigentes", () => {
  const event = confirmedEvent({ id: "bolo-1" });
  const reminder = {
    deliveryType: "bolo-48h",
    eventDate: event.fecha,
    eventTime: event.horaInicio,
  };
  const member = {
    id: 1,
    disponibilidadBolos: { "bolo-1": { estado: "puedo" } },
  };
  const now = new Date("2027-08-13T11:00:00.000Z");

  assert.equal(
    isReminderDeliveryRelevant(reminder, event, member, "2027-08-13", now),
    true,
  );
  assert.equal(
    isReminderDeliveryRelevant(
      reminder,
      event,
      {
        ...member,
        disponibilidadBolos: { "bolo-1": { estado: "tal_vez" } },
      },
      "2027-08-13",
      now,
    ),
    false,
  );
  for (const state of ["no", "tal_vez", undefined]) {
    const memberWithoutAvailability = {
      id: 1,
      ...(state
        ? { disponibilidadBolos: { "bolo-1": { estado: state } } }
        : {}),
    };
    assert.equal(
      isReminderDeliveryRelevant(
        reminder,
        event,
        memberWithoutAvailability,
        "2027-08-13",
        now,
      ),
      false,
    );
  }
  assert.equal(
    isReminderDeliveryRelevant(
      reminder,
      { ...event, estadoBolo: "presupuestado" },
      member,
      "2027-08-13",
      now,
    ),
    false,
  );
  assert.equal(
    isReminderDeliveryRelevant(
      reminder,
      { ...event, fecha: "2027-08-16" },
      member,
      "2027-08-13",
      now,
    ),
    false,
  );
});
