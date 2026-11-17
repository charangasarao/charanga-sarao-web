This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Envío de facturas por correo

El envío de facturas utiliza Resend desde la ruta del servidor `/api/send`. Configura estas variables en `.env.local` y también en el entorno de despliegue:

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Facturas <facturas@tudominio.com>
```

El remitente debe estar verificado en Resend. Mantén `RESEND_API_KEY` únicamente en el servidor; no uses el prefijo `NEXT_PUBLIC_`.

## Notificaciones push

La app usa Web Push para navegadores compatibles y para la PWA instalada en móviles. En iPhone y iPad (iOS 16.4 o posterior), el usuario debe añadir primero la app a la pantalla de inicio y abrirla desde ese icono. Las suscripciones activas se guardan en `push_subscriptions`; Firebase Functions envía las notificaciones y no requiere que el usuario tenga abierta la app.

Para configurar el entorno:

   ```bash
   firebase use --add
   ```

Desde la raíz, instala las dependencias de Functions y genera un par de claves VAPID si todavía no existe:

   ```bash
   cd functions
   npm install
   npm exec -- web-push generate-vapid-keys
   ```

Configura la clave pública en el entorno de ejecución de Next.js como `VAPID_PUBLIC_KEY`. La ruta `/api/push-config` entrega solo esta clave al navegador. Configura el mismo par VAPID como secretos de Functions, junto con un correo de contacto válido:

   ```env
   VAPID_PUBLIC_KEY=clave_publica
   ```

   ```bash
   cd ..
   firebase functions:secrets:set VAPID_PUBLIC_KEY
   firebase functions:secrets:set VAPID_PRIVATE_KEY
   firebase functions:secrets:set VAPID_SUBJECT
   ```

`VAPID_SUBJECT` debe tener formato `mailto:correo@dominio.com`. No publiques la clave privada ni la devuelvas desde la ruta de configuración.

Las Cloud Functions usan Node.js 22. `notifyOnCalendarChanges` conserva los avisos de nuevos bolos confirmados, ensayos y rutas; además avisa de cancelaciones de bolos confirmados y cambios de fecha, hora y vestuario. `sendAvailabilityReminders` se ejecuta a las 09:00 de `Europe/Madrid`, y `sendScheduledNotifications` comprueba cada minuto los recordatorios de 48 y 24 horas. Las entregas pendientes se registran en `push_notification_deliveries`, con deduplicación, exclusión de suscripciones caducadas y reintentos. La colección la administra Functions mediante Admin SDK; no requiere cambios en las reglas de Firestore ni índices compuestos. El acceso del cliente a `push_subscriptions` debe seguir limitado por las reglas existentes.

Para desplegar posteriormente, con autorización:

   ```bash
   firebase deploy --only functions:notifyOnCalendarChanges,functions:sendScheduledNotifications,functions:sendAvailabilityReminders
   ```

El despliegue de las funciones programadas requiere que el proyecto Firebase tenga habilitados Cloud Functions, Cloud Scheduler y la facturación correspondiente. Al aceptar las notificaciones, el navegador también conserva el token FCM en `tokens_notificaciones`; las automatizaciones del servidor usan `push_subscriptions` y no envían correo ni avisos administrativos. Al tocar una notificación que corresponde a un evento del calendario, se abre su detalle en la app.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
