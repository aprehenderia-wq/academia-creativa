import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { getInactiveStudents } from '@/lib/services/enrollments'
import { sendInactivityReminderEmail } from '@/lib/services/email'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const apiKey = process.env.ADMIN_API_KEY
  if (!apiKey) {
    console.error('[send-reminders] Falta ADMIN_API_KEY en el entorno.')
    return NextResponse.json({ error: 'Ruta no configurada.' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  let inactive: Awaited<ReturnType<typeof getInactiveStudents>>
  try {
    inactive = await getInactiveStudents()
  } catch (err) {
    console.error('[send-reminders] Error al detectar inactivos:', err)
    return NextResponse.json({ error: 'Error al consultar la base de datos.' }, { status: 500 })
  }

  const found = inactive.length
  let sent = 0
  let failed = 0

  for (const student of inactive) {
    try {
      await sendInactivityReminderEmail({
        to: student.email,
        studentName: student.studentName,
        courseName: student.courseName,
        courseUrl: student.courseUrl,
      })
      sent++
      console.log(`[send-reminders] Email enviado a ${student.email}`)
    } catch (err) {
      failed++
      console.error(`[send-reminders] Error al enviar a ${student.email}:`, err)
    }
  }

  console.log(`[send-reminders] Resultado: ${found} encontrados, ${sent} enviados, ${failed} fallidos`)
  return NextResponse.json({ found, sent, failed })
}
