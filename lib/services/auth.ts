import { createClient } from '@/lib/supabase/client'

export type AuthResult = { error: string | null }
export type SignUpResult = { userId: string | null; error: string | null }

// Registra un nuevo usuario en Supabase Auth.
// La creación del perfil se delega al Server Action createProfileAction,
// que usa la service_role key y no depende de que haya sesión inmediata.
export async function signUp(
  email: string,
  password: string
): Promise<SignUpResult> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return { userId: null, error: translateAuthError(error.message) }

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

// Solicita un email de recuperación de contraseña.
// redirectTo debe incluir la URL completa del callback (con origen).
export async function resetPasswordForEmail(
  email: string,
  redirectTo: string
): Promise<AuthResult> {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) return { error: translateAuthError(error.message) }
  return { error: null }
}

// Actualiza la contraseña del usuario autenticado.
// Solo funciona cuando hay una sesión activa (tras intercambiar el código del email).
export async function updatePassword(password: string): Promise<AuthResult> {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: translateAuthError(error.message) }
  return { error: null }
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
  if (message.includes('New password should be different')) {
    return 'La nueva contraseña debe ser diferente a la anterior.'
  }
  if (message.includes('Auth session missing') || message.includes('session_not_found')) {
    return 'Tu enlace de recuperación ha expirado. Solicita uno nuevo.'
  }
  return 'Ha ocurrido un error. Inténtalo de nuevo.'
}
