import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente para usar EXCLUSIVAMENTE en código de servidor (Server Components,
// Server Actions, Route Handlers). Usa la service_role key, que salta todas
// las políticas RLS y tiene acceso total a la base de datos.
//
// NUNCA importes este archivo desde un componente con 'use client'.
// El paquete 'server-only' hace que Next.js lance un error en tiempo de
// compilación si alguien intenta importarlo desde el navegador por error.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Cliente de servidor con consciencia de sesión.
// Usa la anon key (respeta RLS) pero lee/escribe las cookies de sesión
// para saber quién es el usuario actual. Usar en Server Components y
// Server Actions donde necesitemos la identidad del usuario autenticado.
export async function createSessionClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // En Server Components el cookieStore es de solo lectura.
            // El middleware se encarga de propagar los cambios de cookies.
          }
        },
      },
    }
  )
}
