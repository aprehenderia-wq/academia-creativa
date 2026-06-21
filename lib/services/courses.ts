import 'server-only'

import { createAdminClient } from '@/lib/supabase/server'

// Tipo que representa un curso tal como viene de la base de datos.
// Coincide exactamente con las columnas de la tabla `courses` del schema.
export type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  price_cents: number
  currency: string
  status: 'draft' | 'published'
  created_at: string
}

// Devuelve solo los cursos publicados, ordenados del más reciente al más antiguo.
// Esta función es la que usará el catálogo público. Los borradores nunca
// llegarán al navegador porque el filtro se aplica aquí, en el servidor.
//
// Usamos el cliente admin (service_role) para que las llamadas del servidor
// no dependan de la sesión del usuario. La restricción de "solo publicados"
// la aplicamos nosotros en el código, no vía RLS, porque este cliente la salta.
export async function getPublishedCourses(): Promise<Course[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error al obtener cursos publicados:', error.message)
    return []
  }

  return data ?? []
}
