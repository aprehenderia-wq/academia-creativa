'use server'

import { createSessionClient } from '@/lib/supabase/server'

/**
 * Marca una lección como completada para el usuario autenticado.
 *
 * Verifica: sesión activa + matrícula en el curso de esa lección.
 * Si ya estaba completada, no falla — devuelve { completed: true } igualmente.
 */
export async function completeLesson(
  lessonId: string
): Promise<{ completed: boolean; error?: string }> {
  const supabase = await createSessionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { completed: false, error: 'No autenticado' }
  }

  // Busca la lección para obtener su curso (a través de la sección)
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, course_sections(course_id)')
    .eq('id', lessonId)
    .single()

  if (!lesson) {
    return { completed: false, error: 'Lección no encontrada' }
  }

  const sectionData = Array.isArray(lesson.course_sections)
    ? lesson.course_sections[0]
    : lesson.course_sections
  const courseId = (sectionData as { course_id: string } | null)?.course_id

  if (!courseId) {
    return { completed: false, error: 'Lección sin curso asociado' }
  }

  // Verifica que el usuario esté matriculado en ese curso
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (!enrollment) {
    return { completed: false, error: 'No estás matriculado en este curso' }
  }

  // Inserta en lesson_progress; si ya existe (restricción única), no hace nada
  const { error: upsertError } = await supabase.from('lesson_progress').upsert(
    { user_id: user.id, lesson_id: lessonId },
    { onConflict: 'user_id,lesson_id', ignoreDuplicates: true }
  )

  if (upsertError) {
    return { completed: false, error: 'Error al guardar el progreso' }
  }

  return { completed: true }
}
