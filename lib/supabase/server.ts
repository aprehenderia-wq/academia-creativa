import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

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
