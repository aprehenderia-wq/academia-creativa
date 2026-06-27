import 'server-only'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type PurchaseConfirmationParams = {
  to: string
  studentName: string
  courseName: string
  courseUrl: string
}

export async function sendPurchaseConfirmationEmail({
  to,
  studentName,
  courseName,
  courseUrl,
}: PurchaseConfirmationParams): Promise<void> {
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'Academia Creativa <onboarding@resend.dev>',
    to,
    subject: `Confirmación de compra: ${courseName}`,
    html: buildPurchaseEmailHtml({ studentName, courseName, courseUrl }),
  })

  if (error) {
    throw new Error(`[email] Error al enviar confirmación: ${error.message}`)
  }
}

function buildPurchaseEmailHtml({
  studentName,
  courseName,
  courseUrl,
}: {
  studentName: string
  courseName: string
  courseUrl: string
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e8e0d8;overflow:hidden;max-width:100%;">

          <!-- Cabecera con color de marca -->
          <tr>
            <td style="background:#C75C2A;padding:28px 40px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:20px;font-weight:600;color:#ffffff;letter-spacing:-0.01em;">
                Academia Creativa
              </p>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;font-weight:600;color:#1a1410;line-height:1.2;">
                &#x1F389; ¡Pago confirmado!
              </h1>
              <p style="margin:0 0 12px;font-size:15px;color:#3d2e24;line-height:1.7;">
                Hola, <strong>${studentName}</strong>.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#3d2e24;line-height:1.7;">
                Tu compra de <strong>${courseName}</strong> se ha procesado correctamente.
                Ya tienes acceso completo al curso.
              </p>

              <!-- Botón CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#C75C2A;border-radius:8px;">
                    <a href="${courseUrl}"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;line-height:1;">
                      Ir al curso &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#9c8778;line-height:1.6;">
                Si el botón no funciona, copia este enlace en tu navegador:<br />
                <a href="${courseUrl}" style="color:#C75C2A;word-break:break-all;">${courseUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td style="border-top:1px solid #e8e0d8;padding:20px 40px;">
              <p style="margin:0;font-size:12px;color:#9c8778;line-height:1.6;">
                Academia Creativa &middot; Cursos de dise&ntilde;o online para creativos de habla hispana.<br />
                Recibiste este mensaje porque realizaste una compra en nuestra plataforma.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
