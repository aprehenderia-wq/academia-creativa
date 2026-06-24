'use server'

import { createAdminClient, createSessionClient } from '@/lib/supabase/server'

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
