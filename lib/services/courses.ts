import 'server-only'

import { cache } from 'react'
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
  stripe_price_id: string | null
  category: string | null
  level: string | null
  instructor_name: string | null
  long_description: string | null
  what_you_learn: string[] | null
  cover_image: string | null
}

// Tipos para el temario: lecciones y secciones con sus lecciones anidadas.
export type Lesson = {
  id: string
  title: string
  video_id: string | null
  position: number
}

export type CourseSection = {
  id: string
  title: string
  position: number
  lessons: Lesson[]
}

export type CourseWithCurriculum = Course & {
  course_sections: CourseSection[]
}

// Tipo interno para el dato crudo que devuelve Supabase antes de ordenarlo.
type RawSection = {
  id: string
  title: string
  position: number
  lessons: Array<{
    id: string
    title: string
    video_id: string | null
    position: number
  }>
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

// Devuelve un curso publicado por su slug, incluyendo todas sus secciones y
// lecciones ordenadas por `position`. Devuelve null si el slug no existe, el
// curso es un borrador, o hay un error de base de datos.
//
// `cache` de React deduplica la llamada: si generateMetadata y el componente
// de página llaman a esta función con el mismo slug en el mismo render,
// Supabase solo recibe UNA consulta.
// Comprueba si un usuario ya tiene matrícula en un curso concreto.
// Devuelve true si la fila existe en enrollments, false en caso contrario.
// Usa el cliente admin para poder consultar la tabla aunque RLS no permita
// SELECT al rol anon; la restricción por user_id y course_id la aplicamos
// nosotros en el código.
export async function getEnrollment(
  userId: string,
  courseId: string
): Promise<boolean> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()

  if (error) {
    console.error('Error al comprobar matrícula:', error.message)
    return false
  }

  return data !== null
}

export const getCourseWithCurriculum = cache(
  async (slug: string): Promise<CourseWithCurriculum | null> => {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('courses')
      .select(`
        id, title, slug, description, price_cents, currency, status, created_at, stripe_price_id,
        category, level, instructor_name, long_description, what_you_learn, cover_image,
        course_sections ( id, title, position, lessons ( id, title, video_id, position ) )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) {
      // PGRST116 = "no rows returned" — slug no existe o el curso es borrador.
      if (error.code === 'PGRST116') return null
      console.error('Error al obtener el curso:', error.message)
      return null
    }

    if (!data) return null

    const rawSections = (data.course_sections as unknown as RawSection[]) ?? []

    const sections: CourseSection[] = rawSections
      .sort((a, b) => a.position - b.position)
      .map((section) => ({
        ...section,
        lessons: [...section.lessons].sort((a, b) => a.position - b.position),
      }))

    const d = data as unknown as Course & { course_sections: unknown }
    return {
      id: d.id,
      title: d.title,
      slug: d.slug,
      description: d.description,
      price_cents: d.price_cents,
      currency: d.currency,
      status: d.status,
      created_at: d.created_at,
      stripe_price_id: d.stripe_price_id ?? null,
      category: d.category ?? null,
      level: d.level ?? null,
      instructor_name: d.instructor_name ?? null,
      long_description: d.long_description ?? null,
      what_you_learn: d.what_you_learn ?? null,
      cover_image: d.cover_image ?? null,
      course_sections: sections,
    }
  }
)
