import { NextResponse } from "next/server";
import { Resend } from "resend";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

export async function POST(request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL?.trim();
    if (!apiKey || !from) {
      return NextResponse.json(
        {
          error:
            "Falta configurar RESEND_API_KEY y RESEND_FROM_EMAIL en el servidor.",
        },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const destinatario = String(formData.get("to") || "").trim();
    const musico = String(formData.get("musico") || "").trim();
    const cuerda = String(formData.get("cuerda") || "").trim();
    const concepto = String(formData.get("concepto") || "").trim();
    const importe = Number(formData.get("importe"));
    const fecha = String(formData.get("fecha") || "").trim();
    const file = formData.get("file");

    if (!EMAIL_PATTERN.test(destinatario)) {
      return NextResponse.json(
        { error: "El correo destinatario no es válido." },
        { status: 400 },
      );
    }
    if (
      !musico ||
      musico.length > 200 ||
      cuerda.length > 100 ||
      !concepto ||
      concepto.length > 300 ||
      !Number.isFinite(importe) ||
      importe <= 0 ||
      !fecha ||
      fecha.length > 50
    ) {
      return NextResponse.json(
        { error: "Los datos de la factura no son válidos." },
        { status: 400 },
      );
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Debes adjuntar el archivo de la factura." },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo no puede superar los 25 MB." },
        { status: 413 },
      );
    }
    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser un PDF o una imagen." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const nombreArchivo =
      file.name.replace(/[\\/\r\n"]/g, "_").slice(0, 180) || "factura";
    const nombreSeguro = escapeHtml(musico);
    const cuerdaSegura = escapeHtml(cuerda || "No especificada");
    const conceptoSeguro = escapeHtml(concepto);
    const fechaSegura = escapeHtml(fecha);
    const asuntoSeguro = musico.replace(/[\r\n]/g, " ").slice(0, 200);
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [destinatario],
      subject: `Nueva factura Charanga Sarao - ${asuntoSeguro}`,
      html: `
        <h2>Nueva factura de Charanga Sarao</h2>
        <p><strong>Músico:</strong> ${nombreSeguro}</p>
        <p><strong>Cuerda:</strong> ${cuerdaSegura}</p>
        <p><strong>Concepto / proveedor:</strong> ${conceptoSeguro}</p>
        <p><strong>Importe:</strong> ${importe.toFixed(2)} €</p>
        <p><strong>Fecha de subida:</strong> ${fechaSegura}</p>
        <p>Se adjunta el archivo de la factura: ${escapeHtml(nombreArchivo)}.</p>
      `,
      attachments: [
        { filename: nombreArchivo, content: buffer, contentType: file.type },
      ],
    });

    if (error) {
      console.error("Resend no pudo enviar la factura:", error);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Error procesando el envío de la factura:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Error inesperado al enviar la factura.",
      },
      { status: 500 },
    );
  }
}
