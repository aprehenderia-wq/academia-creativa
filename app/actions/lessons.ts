'use server'

import { createSessionClient, createAdminClient } from '@/lib/supabase/server'
import { issueCertificate } from '@/lib/services/certificates'

export async function completeLesson(lessonId: string): Promise<{
  completed: boolean
  courseCompleted?: boolean
  certificateId?: string
  error?: string
}> {
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

  // Verifica matrícula
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (!enrollment) {
    return { completed: false, error: 'No estás matriculado en este curso' }
  }

  // Marca la lección como completada (sin error si ya existía)
  const { error: upsertError } = await supabase.from('lesson_progress').upsert(
    { user_id: user.id, lesson_id: lessonId },
    { onConflict: 'user_id,lesson_id', ignoreDuplicates: true }
  )

  if (upsertError) {
    return { completed: false, error: 'Error al guardar el progreso' }
  }

  // ── Detección de curso completado ──────────────────────────────────────────
  // Usamos admin para no depender de las políticas RLS al contar lecciones
  const admin = createAdminClient()

  const { data: sections } = await admin
    .from('course_sections')
    .select('id')
    .eq('course_id', courseId)

  const sectionIds = (sections ?? []).map((s) => s.id)

  const { data: allLessons } = sectionIds.length
    ? await admin.from('lessons').select('id').in('section_id', sectionIds)
    : { data: [] as { id: string }[] }

  const totalLessons = (allLessons ?? []).length

  if (totalLessons === 0) {
    return { completed: true }
  }

  const lessonIds = (allLessons ?? []).map((l) => l.id)

  const { count } = await supabase
    .from('lesson_progress')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('lesson_id', lessonIds)

  const courseCompleted = (count ?? 0) >= totalLessons

  if (!courseCompleted) {
    return { completed: true, courseCompleted: false }
  }

  // Emite el certificado (o recupera el existente)
  const certificateId = await issueCertificate(user.id, courseId)

  return {
    completed: true,
    courseCompleted: true,
    certificateId: certificateId ?? undefined,
  }
}
