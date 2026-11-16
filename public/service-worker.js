self.addEventListener("push", (event) => {
  if (!event.data) return;

  const notification = event.data.json();
  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: "/PEGATINAS.jpg",
      badge: "/PEGATINAS.jpg",
      tag: notification.tag,
      data: { url: notification.url || "/" },
    }),
  );
});

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
