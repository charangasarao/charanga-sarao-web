import { NextResponse } from "next/server";

export function GET() {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  if (!vapidPublicKey) {
    return NextResponse.json(
      { error: "El servicio de notificaciones no está configurado." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { vapidPublicKey },
    { headers: { "Cache-Control": "no-store" } },
  );
}
