const MADRID_TIME_ZONE = "Europe/Madrid";
const ACTIVE_EVENT_STATES = new Set(["confirmado", "ensayo"]);
const ANSWERED_AVAILABILITY_STATES = new Set(["puedo", "no", "tal_vez"]);
const OUTFIT_LABELS = {
  "Por definir": "Por definir",
  Negro: "Camiseta Negra",
  Blanco: "Camiseta Blanca",
  "Full Print": "Full Print Sarao",
};

function getId(value) {
  return value == null ? "" : String(value);
}

function getMemberId(member) {
  return getId(member?.id ?? member?.nombre).trim();
}

function getEventTitle(calendarEvent) {
  return calendarEvent?.titulo || calendarEvent?.lugar || "Bolo";
}

function formatDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return value || "sin indicar";
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function getOutfitLabel(value) {
  return OUTFIT_LABELS[value] || value || "Por definir";
}

function getNewRoutes(previousEvent, currentEvent) {
  const previousRouteIds = new Set(
    (Array.isArray(previousEvent?.cochesAsignados)
      ? previousEvent.cochesAsignados
      : []
    )
      .map((route) => getId(route?.id))
      .filter(Boolean),
  );
  return (
    Array.isArray(currentEvent?.cochesAsignados)
      ? currentEvent.cochesAsignados
      : []
  ).filter(
    (route) => route?.id != null && !previousRouteIds.has(getId(route.id)),
  );
}

function getMemberIds(members) {
  return [
    ...new Set(
      (Array.isArray(members) ? members : []).map(getMemberId).filter(Boolean),
    ),
  ];
}

function getEventReminderDedupeKey(
  deliveryType,
  eventId,
  eventDate,
  eventTime,
) {
  return `${deliveryType}:${getId(eventId)}:${eventDate}:${eventTime}`;
}

function getFcmTokenGroups(tokenDocuments) {
  const tokens = new Map();
  for (const document of Array.isArray(tokenDocuments) ? tokenDocuments : []) {
    const token = document?.token;
    if (typeof token !== "string" || !token.trim()) continue;
    const normalizedToken = token.trim();
    const documentIds = tokens.get(normalizedToken) || [];
    if (document?.id != null) documentIds.push(getId(document.id));
    tokens.set(normalizedToken, documentIds);
  }
  return [...tokens.entries()].map(([token, documentIds]) => ({
    token,
    documentIds: [...new Set(documentIds)],
  }));
}

function getCalendarNotifications(previousData, currentData) {
  const previousEvents = Array.isArray(previousData?.bolos)
    ? previousData.bolos
    : [];
  const currentEvents = Array.isArray(currentData?.bolos)
    ? currentData.bolos
    : [];
  const memberIds = getMemberIds(currentData?.miembros);
  const notifications = [];

  for (const calendarEvent of currentEvents) {
    const eventId = getId(calendarEvent?.id);
    if (!eventId) continue;

    const previousEvent = previousEvents.find(
      (candidate) => getId(candidate?.id) === eventId,
    );
    const wasOnCalendar = ACTIVE_EVENT_STATES.has(previousEvent?.estadoBolo);
    const isOnCalendar = ACTIVE_EVENT_STATES.has(calendarEvent.estadoBolo);

    if (isOnCalendar && !wasOnCalendar) {
      const isEnsayo = calendarEvent.estadoBolo === "ensayo";
      notifications.push({
        kind: isEnsayo ? "nuevo-ensayo" : "nuevo-bolo",
        eventId,
        recipientIds: null,
        payload: {
          title: isEnsayo
            ? "Nuevo ensayo en el calendario"
            : "Nuevo bolo en el calendario",
          body: isEnsayo
            ? `Tenemos nuevo ENSAYO fijado panzabucheeee: ${calendarEvent.lugar || "lugar sin indicar"}. Fecha: ${formatDate(calendarEvent.fecha)}. Hora: ${calendarEvent.horaInicio || "sin indicar"}.`
            : "Tenemos nuevo BOLO croquetoooooo",
          tag: `evento-${eventId}-nuevo-${isEnsayo ? "ensayo" : "bolo"}`,
          url: `/?evento=${encodeURIComponent(eventId)}`,
        },
      });
    }

    if (!previousEvent) continue;

    if (
      previousEvent.estadoBolo === "confirmado" &&
      calendarEvent.estadoBolo === "confirmado"
    ) {
      const changedDateOrTime =
        previousEvent.fecha !== calendarEvent.fecha ||
        previousEvent.horaInicio !== calendarEvent.horaInicio ||
        previousEvent.horaFin !== calendarEvent.horaFin;
      if (changedDateOrTime) {
        notifications.push({
          kind: "cambio-horario",
          eventId,
          recipientIds: memberIds,
          payload: {
            title: "Cambio de horario",
            body: `El bolo "${getEventTitle(calendarEvent)}" ha cambiado. Antes: ${formatDate(previousEvent.fecha)}, ${previousEvent.horaInicio || "hora sin indicar"}${previousEvent.horaFin ? ` - ${previousEvent.horaFin}` : ""}. Ahora: ${formatDate(calendarEvent.fecha)}, ${calendarEvent.horaInicio || "hora sin indicar"}${calendarEvent.horaFin ? ` - ${calendarEvent.horaFin}` : ""}.`,
            tag: `evento-${eventId}-cambio-horario`,
            url: `/?evento=${encodeURIComponent(eventId)}`,
          },
        });
      }

      if (previousEvent.vestuario !== calendarEvent.vestuario) {
        notifications.push({
          kind: "cambio-vestuario",
          eventId,
          recipientIds: memberIds,
          payload: {
            title: "Cambio de vestuario",
            body: `El vestuario de "${getEventTitle(calendarEvent)}" ha cambiado: ${getOutfitLabel(previousEvent.vestuario)} → ${getOutfitLabel(calendarEvent.vestuario)}.`,
            tag: `evento-${eventId}-cambio-vestuario`,
            url: `/?evento=${encodeURIComponent(eventId)}`,
          },
        });
      }
    }

    for (const route of getNewRoutes(previousEvent, calendarEvent)) {
      notifications.push({
        kind: `nueva-ruta-${getId(route.id)}`,
        eventId,
        recipientIds: null,
        payload: {
          title: "Nueva ruta publicada",
          body: `${route.creadoPor || route.conductor || "Alguien"} ha puesto su putivuelta para este bolo: ${calendarEvent.lugar || getEventTitle(calendarEvent)}`,
          tag: `ruta-${eventId}-${getId(route.id)}`,
          url: `/?evento=${encodeURIComponent(eventId)}`,
        },
      });
    }
  }

  for (const previousEvent of previousEvents) {
    const eventId = getId(previousEvent?.id);
    if (
      !eventId ||
      previousEvent.estadoBolo !== "confirmado" ||
      currentEvents.some((candidate) => getId(candidate?.id) === eventId)
    ) {
      continue;
    }

    notifications.push({
      kind: "bolo-cancelado",
      eventId,
      recipientIds: memberIds,
      payload: {
        title: "Bolo cancelado",
        body: `Se ha cancelado "${getEventTitle(previousEvent)}", previsto para el ${formatDate(previousEvent.fecha)}.`,
        tag: `evento-${eventId}-bolo-cancelado`,
        url: `/?evento=${encodeURIComponent(eventId)}`,
      },
    });
  }

  return notifications;
}

function shouldSendRouteWebPush(subscription, fcmDevices) {
  const devices = Array.isArray(fcmDevices) ? fcmDevices : [];
  const subscriptionId = getId(subscription?.subscriptionId).trim();
  if (
    subscriptionId &&
    devices.some(
      (device) => getId(device?.pushSubscriptionId).trim() === subscriptionId,
    )
  ) {
    return false;
  }

  const userId = getId(subscription?.userId).trim();
  const userDevices = devices.filter(
    (device) =>
      userId &&
      getId(device?.userId).trim() === userId &&
      typeof device?.token === "string" &&
      device.token.trim(),
  );
  if (!subscriptionId) return userDevices.length === 0;
  return !userDevices.some(
    (device) => !getId(device?.pushSubscriptionId).trim(),
  );
}

function getZonedParts(date, timeZone = MADRID_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
}

function getMadridDate(date) {
  const parts = getZonedParts(date);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function getEventStart(calendarEvent) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
    String(calendarEvent?.fecha || ""),
  );
  const timeMatch = /^\s*(\d{1,2}):(\d{2})\s*h?\s*$/i.exec(
    String(calendarEvent?.horaInicio || ""),
  );
  if (!dateMatch || !timeMatch) return null;

  const [, yearText, monthText, dayText] = dateMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59
  ) {
    return null;
  }

  const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const calendarCheck = new Date(targetAsUtc);
  if (
    calendarCheck.getUTCFullYear() !== year ||
    calendarCheck.getUTCMonth() !== month - 1 ||
    calendarCheck.getUTCDate() !== day
  ) {
    return null;
  }

  let instant = targetAsUtc;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = getZonedParts(new Date(instant));
    const representedAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    const difference = targetAsUtc - representedAsUtc;
    if (difference === 0) break;
    instant += difference;
  }

  const finalParts = getZonedParts(new Date(instant));
  if (
    finalParts.year !== year ||
    finalParts.month !== month ||
    finalParts.day !== day ||
    finalParts.hour !== hour ||
    finalParts.minute !== minute
  ) {
    return null;
  }

  return new Date(instant);
}

function isEventReminderDue(calendarEvent, hoursBefore, scheduledTime) {
  const eventStart = getEventStart(calendarEvent);
  if (!eventStart) return false;

  const reminderTime = new Date(
    eventStart.getTime() - hoursBefore * 60 * 60 * 1000,
  );
  const scheduledAt = scheduledTime.getTime();
  return (
    scheduledAt >= reminderTime.getTime() && scheduledAt < eventStart.getTime()
  );
}

function isPendingAvailability(calendarEvent, member, today) {
  if (calendarEvent?.estadoBolo !== "confirmado") return false;
  const eventDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
    String(calendarEvent?.fecha || ""),
  );
  const todayDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(today || ""));
  if (!eventDate || !todayDate) return false;

  const daysUntil =
    (Date.UTC(
      Number(eventDate[1]),
      Number(eventDate[2]) - 1,
      Number(eventDate[3]),
    ) -
      Date.UTC(
        Number(todayDate[1]),
        Number(todayDate[2]) - 1,
        Number(todayDate[3]),
      )) /
    (24 * 60 * 60 * 1000);
  if (!Number.isInteger(daysUntil) || daysUntil < 0 || daysUntil > 7) {
    return false;
  }

  const availabilityState =
    member?.disponibilidadBolos?.[getId(calendarEvent.id)]?.estado;
  return !ANSWERED_AVAILABILITY_STATES.has(availabilityState);
}

function isReminderDeliveryRelevant(
  delivery,
  calendarEvent,
  member,
  today,
  now = new Date(),
) {
  if (!calendarEvent || !member) return false;

  if (delivery.deliveryType === "availability") {
    return (
      delivery.reminderDate === today &&
      delivery.eventDate === calendarEvent.fecha &&
      isPendingAvailability(calendarEvent, member, today)
    );
  }

  const eventStart = getEventStart(calendarEvent);
  if (!eventStart || eventStart.getTime() <= now.getTime()) return false;

  if (
    delivery.eventDate !== calendarEvent.fecha ||
    delivery.eventTime !== calendarEvent.horaInicio
  ) {
    return false;
  }

  if (delivery.deliveryType === "bolo-48h") {
    return (
      calendarEvent.estadoBolo === "confirmado" &&
      member?.disponibilidadBolos?.[getId(calendarEvent.id)]?.estado === "puedo"
    );
  }

  if (delivery.deliveryType === "ensayo-24h") {
    return calendarEvent.estadoBolo === "ensayo";
  }

  return true;
}

function buildAvailabilityReminder(calendarEvent) {
  return {
    title: "Pendiente de disponibilidad",
    body: `¿Puedes venir a "${getEventTitle(calendarEvent)}" el ${formatDate(calendarEvent.fecha)}? Indica tu disponibilidad en la app.`,
    tag: `disponibilidad-${getId(calendarEvent.id)}`,
    url: `/?evento=${encodeURIComponent(getId(calendarEvent.id))}`,
  };
}

function normalizeMemberName(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("es");
}

function getAssignedRoute(calendarEvent, member) {
  const memberName = normalizeMemberName(member?.nombre);
  if (!memberName) return null;
  const routes = Array.isArray(calendarEvent?.cochesAsignados)
    ? calendarEvent.cochesAsignados
    : [];
  const passengerRoute = routes.find((route) =>
    (Array.isArray(route?.pasajeros) ? route.pasajeros : []).some(
      (passenger) => normalizeMemberName(passenger) === memberName,
    ),
  );
  if (passengerRoute) return passengerRoute;
  return (
    routes.find(
      (route) => normalizeMemberName(route?.conductor) === memberName,
    ) || null
  );
}

function getPickupPoint(route, member) {
  const pickupPoints = route?.recogidasPasajeros || {};
  const memberName = normalizeMemberName(member?.nombre);
  if (pickupPoints[memberName]) return pickupPoints[memberName];
  const matchingEntry = Object.entries(pickupPoints).find(
    ([name]) => normalizeMemberName(name) === memberName,
  );
  return matchingEntry?.[1] || "";
}

function buildBoloReminder(calendarEvent, member) {
  const lines = [
    `Bolo: ${getEventTitle(calendarEvent)}`,
    `Fecha: ${formatDate(calendarEvent.fecha)}`,
    `Inicio: ${calendarEvent.horaInicio || "sin indicar"}`,
  ];
  if (calendarEvent.horaFin) lines.push(`Fin: ${calendarEvent.horaFin}`);
  lines.push(`Vestuario: ${getOutfitLabel(calendarEvent.vestuario)}`);

  const route = getAssignedRoute(calendarEvent, member);
  if (!route) {
    lines.push("Coche: No tienes una ruta de coche asignada.");
  } else {
    const stops = (Array.isArray(route.paradas) ? route.paradas : [])
      .map((stop) => [stop?.lugar, stop?.hora].filter(Boolean).join(" "))
      .filter(Boolean);
    lines.push(
      `Coche: Conductor: ${route.conductor || "sin indicar"}; origen: ${route.origen || "sin indicar"}; hora de salida: ${route.horaSalida || "sin indicar"}; paradas: ${stops.length ? stops.join(", ") : "ninguna"}; destino: ${route.destino || "sin indicar"}; hora prevista de llegada: ${route.horaLlegada || "sin indicar"}.`,
    );
    const pickupPoint = getPickupPoint(route, member);
    if (pickupPoint) lines.push(`Tu punto de recogida: ${pickupPoint}`);
  }

  return {
    title: "Tu bolo es dentro de 48 horas",
    body: lines.join("\n"),
    tag: `bolo-48h-${getId(calendarEvent.id)}`,
    url: `/?evento=${encodeURIComponent(getId(calendarEvent.id))}`,
  };
}

function buildEnsayoReminder(calendarEvent) {
  const lines = [
    `Ensayo: ${getEventTitle(calendarEvent)}`,
    `Fecha: ${formatDate(calendarEvent.fecha)}`,
    `Hora: ${calendarEvent.horaInicio || "sin indicar"}`,
    `Lugar: ${calendarEvent.lugar || "sin indicar"}`,
  ];
  if (calendarEvent.repertorio) {
    lines.push(`Repertorio: ${calendarEvent.repertorio}`);
  }

  return {
    title: "Mañana tienes ensayo",
    body: lines.join("\n"),
    tag: `ensayo-24h-${getId(calendarEvent.id)}`,
    url: `/?evento=${encodeURIComponent(getId(calendarEvent.id))}`,
  };
}

module.exports = {
  MADRID_TIME_ZONE,
  buildAvailabilityReminder,
  buildBoloReminder,
  buildEnsayoReminder,
  formatDate,
  getEventReminderDedupeKey,
  getFcmTokenGroups,
  getAssignedRoute,
  getCalendarNotifications,
  getEventStart,
  getId,
  isEventReminderDue,
  getMemberId,
  getMadridDate,
  isReminderDeliveryRelevant,
  isPendingAvailability,
  shouldSendRouteWebPush,
};
