importScripts('https://www.gstatic.com/firebasejs/10.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.x.x/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB3mcxg6HXTC4gz8HJGRSnjOLp7CK7TXVs", // Reemplaza esto si es necesario con tu apiKey real de Firebase
  projectId: "charanga-sarao",
  messagingSenderId: "285421321243", // Sustituye por el número de tu proyecto en la consola de Firebase
  appId: "1:285421321243:web:374442f27dc2fe64d5ccbe"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano ', payload);
  
  const notificationTitle = payload.notification.title || 'Charanga Sarao';
  const notificationOptions = {
    body: payload.notification.body || 'Tienes una nueva notificación.',
    icon: '/icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});