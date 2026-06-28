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

type WelcomeEmailParams = {
  to: string
  studentName: string
}

export async function sendWelcomeEmail({
  to,
  studentName,
}: WelcomeEmailParams): Promise<void> {
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'Academia Creativa <onboarding@resend.dev>',
    to,
    subject: '¡Bienvenida a Academia Creativa!',
    html: buildWelcomeEmailHtml({ studentName }),
  })

  if (error) {
    throw new Error(`[email] Error al enviar bienvenida: ${error.message}`)
  }
}

export function buildWelcomeEmailHtml({ studentName }: { studentName: string }): string {
  const catalogUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://academia-creativa-one.vercel.app'}`

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
                &#x1F44B; ¡Bienvenida, ${studentName}!
              </h1>
              <p style="margin:0 0 16px;font-size:15px;color:#3d2e24;line-height:1.7;">
                Nos alegra mucho que estés aquí. Tu cuenta en Academia Creativa
                ya está lista.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#3d2e24;line-height:1.7;">
                Tenemos cursos de diseño gráfico, branding, ilustración y motion
                graphics pensados para que crezcas como diseñadora a tu propio
                ritmo. Explora el catálogo y encuentra el que más te inspire.
              </p>

              <!-- Botón CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#C75C2A;border-radius:8px;">
                    <a href="${catalogUrl}"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;line-height:1;">
                      Ver cursos &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#9c8778;line-height:1.6;">
                Si el botón no funciona, visita:<br />
                <a href="${catalogUrl}" style="color:#C75C2A;word-break:break-all;">${catalogUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td style="border-top:1px solid #e8e0d8;padding:20px 40px;">
              <p style="margin:0;font-size:12px;color:#9c8778;line-height:1.6;">
                Academia Creativa &middot; Cursos de dise&ntilde;o online para creativos de habla hispana.<br />
                Recibiste este mensaje porque creaste una cuenta en nuestra plataforma.
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

export function buildPurchaseEmailHtml({
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

type InactivityReminderParams = {
  to: string
  studentName: string
  courseName: string
  courseUrl: string
}

export async function sendInactivityReminderEmail({
  to,
  studentName,
  courseName,
  courseUrl,
}: InactivityReminderParams): Promise<void> {
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'Academia Creativa <onboarding@resend.dev>',
    to,
    subject: `Te echamos de menos en ${courseName}`,
    html: buildInactivityReminderHtml({ studentName, courseName, courseUrl }),
  })

  if (error) {
    throw new Error(`[email] Error al enviar recordatorio de inactividad: ${error.message}`)
  }
}

export function buildInactivityReminderHtml({
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

          <tr>
            <td style="background:#C75C2A;padding:28px 40px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:20px;font-weight:600;color:#ffffff;letter-spacing:-0.01em;">
                Academia Creativa
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;font-weight:600;color:#1a1410;line-height:1.2;">
                &#x1F4AA; ¡Tú puedes, ${studentName}!
              </h1>
              <p style="margin:0 0 16px;font-size:15px;color:#3d2e24;line-height:1.7;">
                Notamos que llevas un tiempo sin entrar a <strong>${courseName}</strong>
                y queremos recordarte que tu progreso te está esperando.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#3d2e24;line-height:1.7;">
                Aprender diseño es un camino, no una carrera. Con unos minutos al día
                ya estás avanzando. ¿Te animas a retomarlo hoy?
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#C75C2A;border-radius:8px;">
                    <a href="${courseUrl}"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;line-height:1;">
                      Retomar el curso &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#9c8778;line-height:1.6;">
                Si el botón no funciona, visita:<br />
                <a href="${courseUrl}" style="color:#C75C2A;word-break:break-all;">${courseUrl}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid #e8e0d8;padding:20px 40px;">
              <p style="margin:0;font-size:12px;color:#9c8778;line-height:1.6;">
                Academia Creativa &middot; Cursos de dise&ntilde;o online para creativos de habla hispana.<br />
                Recibiste este mensaje porque tienes una matr&iacute;cula activa en nuestra plataforma.
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
