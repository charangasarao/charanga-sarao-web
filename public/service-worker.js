self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const notificationUrl = new URL(
        event.notification.data?.url || "/",
        self.location.origin,
      );
      const targetUrl =
        notificationUrl.origin === self.location.origin
          ? notificationUrl.href
          : self.location.origin;
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windowClients) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })(),
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let notification;
  try {
    notification = event.data.json();
  } catch (error) {
    console.error("No se pudo interpretar el mensaje push.", error);
    return;
  }
  if (
    !notification ||
    typeof notification !== "object" ||
    (typeof notification.title !== "string" &&
      typeof notification.body !== "string")
  ) {
    return;
  }

  event.waitUntil(
    self.registration.showNotification(notification.title || "Charanga Sarao", {
      body: notification.body,
      icon: "/PEGATINAS-512.png",
      badge: "/PEGATINAS-192.png",
      tag: notification.tag,
      data: { url: notification.url || "/" },
    }),
  );
});

importScripts(
  "https://www.gstatic.com/firebasejs/13.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyB3mcxg6HXTC4gz8HJGRSnjOLp7CK7TXVs",
  authDomain: "charanga-sarao.firebaseapp.com",
  projectId: "charanga-sarao",
  storageBucket: "charanga-sarao.firebasestorage.app",
  messagingSenderId: "285421321243",
  appId: "1:285421321243:web:374442f27dc2fe64d5ccbe",
  measurementId: "G-R44RDDS6YB",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return;

  const data = payload.data || {};
  return self.registration.showNotification(data.title || "Charanga Sarao", {
    body: data.body || "Tienes una nueva notificación.",
    icon: "/PEGATINAS-512.png",
    badge: "/PEGATINAS-192.png",
    tag: data.tag,
    data: { url: data.url || "/" },
  });
});
