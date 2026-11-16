import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { NextResponse } from "next/server";

const MAX_TOKENS = 500;

function getFirebaseMessaging() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Falta configurar las credenciales de Firebase Admin.");
  }

  const app =
    getApps().find((firebaseApp) => firebaseApp.name === "[DEFAULT]") ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });

  return getMessaging(app);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "El cuerpo de la petición no es JSON válido." },
      { status: 400 },
    );
  }

  const { titulo, mensaje, tokens } = body ?? {};
  if (
    !Array.isArray(tokens) ||
    tokens.length === 0 ||
    tokens.length > MAX_TOKENS ||
    tokens.some((token) => typeof token !== "string" || !token.trim())
  ) {
    return NextResponse.json(
      {
        success: false,
        error: `Debes enviar entre 1 y ${MAX_TOKENS} tokens de dispositivo válidos.`,
      },
      { status: 400 },
    );
  }

  try {
    const response = await getFirebaseMessaging().sendEachForMulticast({
      notification: {
        title: titulo || "Charanga Sarao",
        body: mensaje || "Nuevo aviso importante.",
      },
      tokens,
    });

    return NextResponse.json({
      success: true,
      response: {
        successCount: response.successCount,
        failureCount: response.failureCount,
      },
    });
  } catch (error) {
    console.error("Error al enviar notificación:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error inesperado al enviar la notificación.",
      },
      { status: 500 },
    );
  }
}
