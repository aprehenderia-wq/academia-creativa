'use client'

import { createBrowserClient } from '@supabase/ssr'

// Cliente para usar en componentes del navegador ('use client').
// Solo usa la anon key: tiene permisos limitados, controlados por las
// políticas RLS de Supabase. Es seguro exponerla en el navegador.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
