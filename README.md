This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Envío de facturas por correo

El envío de facturas utiliza Resend desde la ruta del servidor `/api/send`. Configura estas variables en `.env.local` y también en el entorno de despliegue:

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Facturas <facturas@tudominio.com>
```

El remitente debe estar verificado en Resend. Mantén `RESEND_API_KEY` únicamente en el servidor; no uses el prefijo `NEXT_PUBLIC_`.

## Notificaciones push

La app usa Web Push para navegadores compatibles y para la PWA instalada en móviles. En iPhone y iPad (iOS 16.4 o posterior), el usuario debe añadir primero la app a la pantalla de inicio y abrirla desde ese icono. El permiso se solicita una sola vez por perfil y dispositivo, después del primer inicio de sesión.

1. Selecciona el proyecto Firebase:

   ```bash
   firebase use --add
   ```

2. Desde la raíz del proyecto, instala las dependencias y genera un par de claves VAPID:

   ```bash
   cd functions
   npm install
   npm exec -- web-push generate-vapid-keys
   ```

3. Vuelve a la raíz del proyecto y configura la clave pública en el servidor Next.js y en Firebase Functions con el nombre `VAPID_PUBLIC_KEY`:

   ```env
   VAPID_PUBLIC_KEY=clave_publica
   ```

   Importa el par VAPID en la configuración de Cloud Messaging del proyecto Firebase. En Next.js, la ruta `/api/push-config` lee `process.env.VAPID_PUBLIC_KEY` y entrega solo la clave pública al navegador para crear la suscripción y obtener el token FCM. Configura la misma clave pública como secreto de Functions, junto con la clave privada y un correo de contacto válido:

   ```bash
   cd ..
   firebase functions:secrets:set VAPID_PUBLIC_KEY
   firebase functions:secrets:set VAPID_PRIVATE_KEY
   firebase functions:secrets:set VAPID_SUBJECT
   ```

   `VAPID_SUBJECT` debe tener formato `mailto:correo@dominio.com`. No publiques la clave privada ni la devuelvas desde la ruta de configuración.

4. Despliega la función que envía las notificaciones:

   ```bash
   firebase deploy --only functions:notifyOnCalendarChanges
   ```

Las suscripciones Web Push se guardan en `push_subscriptions`. Al aceptar las notificaciones, el navegador también obtiene un token de Firebase Cloud Messaging y lo guarda en `tokens_notificaciones`, asociado al perfil activo mediante `userId` y `userName`; cada dispositivo conserva su propio documento. Las reglas de Firestore deben permitir al cliente crear, actualizar y borrar sus documentos en ambas colecciones. La app usa perfiles propios y no Firebase Authentication, por lo que las reglas actuales del proyecto deben tener en cuenta ese modelo. La función compara cambios del calendario en el servidor: avisa de nuevos bolos y ensayos a los usuarios suscritos, y de nuevas rutas solo a los músicos suscritos que marcaron «Puedo» para ese bolo. Al tocar una notificación se abre el detalle correspondiente en la app.

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
