'use server'

import { createAdminClient, createSessionClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/services/email'

// Crea la fila en la tabla profiles para el usuario recién registrado.
// Usa el admin client (service_role) para garantizar que el insert funciona
// aunque la confirmación de email esté activa.
// El userId siempre viene de la sesión del servidor, nunca del cliente,
// para evitar que alguien cree perfiles a nombre de otra persona.
export async function createProfileAction(
  fullName: string
): Promise<{ error: string | null }> {
  const supabase = await createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No hay sesión activa.' }

  const admin = createAdminClient()
  const { error } = await admin.from('profiles').upsert({
    id: user.id,
    full_name: fullName,
    email: user.email,
  })

  if (error) {
    console.error('Error al crear perfil:', error)
    return { error: 'Error al guardar el perfil.' }
  }

  return { error: null }
}

// Envía el email de bienvenida tras el registro. Si falla, se loguea pero
// no hace fallar el registro: el alumno ya tiene cuenta.
export async function sendWelcomeEmailAction(
  email: string,
  fullName: string
): Promise<void> {
  try {
    await sendWelcomeEmail({ to: email, studentName: fullName })
  } catch (err) {
    console.error(
      '[registro] Error al enviar email de bienvenida:',
      err instanceof Error ? err.message : err
    )
  }
}
