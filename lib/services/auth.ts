import { createClient } from '@/lib/supabase/client'

export type AuthResult = { error: string | null }
export type SignUpResult = { userId: string | null; error: string | null }

// Registra un nuevo usuario en Supabase Auth y crea su perfil.
// Si la confirmación de email está desactivada, la sesión llega de inmediato
// y podemos crear el perfil con el mismo cliente autenticado (respeta RLS).
export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<SignUpResult> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return { userId: null, error: translateAuthError(error.message) }

  if (data.user && data.session) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      email: data.user.email,
    })
  }

  return { userId: data.user?.id ?? null, error: null }
}

// Inicia sesión con email y contraseña.
// Devuelve null en error si tuvo éxito, o un mensaje en español si falló.
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: translateAuthError(error.message) }
  return { error: null }
}

// Cierra la sesión del usuario actual.
export async function signOut(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}

// Convierte los mensajes de error de Supabase (en inglés) a mensajes
// amigables en español para mostrar al usuario.
export function translateAuthError(message: string): string {
  if (
    message.includes('User already registered') ||
    message.includes('already registered')
  ) {
    return 'Ya existe una cuenta con este email.'
  }
  if (message.includes('Password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }
  if (message.includes('Invalid login credentials')) {
    return 'El email o la contraseña no son correctos.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Confirma tu correo electrónico antes de iniciar sesión.'
  }
  return 'Ha ocurrido un error. Inténtalo de nuevo.'
}
