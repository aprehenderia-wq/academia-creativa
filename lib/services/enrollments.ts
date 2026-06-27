import 'server-only'
import { createSessionClient } from '@/lib/supabase/server'

export type EnrolledCourse = {
  course_id: string
  title: string
  slug: string
  enrolled_at: string
  progress: number
  completed_lessons: number
  total_lessons: number
}

export async function getEnrolledCourses(userId: string): Promise<EnrolledCourse[]> {
  const supabase = await createSessionClient()

  // Trae las matrículas del usuario con los datos del curso
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select(`
      course_id,
      enrolled_at,
      courses (
        title,
        slug
      )
    `)
    .eq('user_id', userId)

  if (error || !enrollments?.length) return []

  const courseIds = enrollments.map(e => e.course_id)

  // Trae todas las secciones de los cursos matriculados
  const { data: sections } = await supabase
    .from('course_sections')
    .select('id, course_id')
    .in('course_id', courseIds)

  const allSectionIds = (sections ?? []).map(s => s.id)

  // Trae todas las lecciones de esas secciones
  const { data: lessons } = allSectionIds.length
    ? await supabase
        .from('lessons')
        .select('id, section_id')
        .in('section_id', allSectionIds)
    : { data: [] as { id: string; section_id: string }[] }

  // Trae las lecciones que el usuario ya completó (hoy estará vacío, y está bien)
  const allLessonIds = (lessons ?? []).map(l => l.id)
  let completedIds = new Set<string>()
  if (allLessonIds.length > 0) {
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .in('lesson_id', allLessonIds)
    completedIds = new Set((progressData ?? []).map(p => p.lesson_id))
  }

  // Mapas de lookup para calcular el progreso sin consultas adicionales
  const sectionsByCourse = (sections ?? []).reduce<Record<string, string[]>>((acc, s) => {
    acc[s.course_id] = [...(acc[s.course_id] ?? []), s.id]
    return acc
  }, {})

  const lessonsBySection = (lessons ?? []).reduce<Record<string, string[]>>((acc, l) => {
    acc[l.section_id] = [...(acc[l.section_id] ?? []), l.id]
    return acc
  }, {})

  return enrollments.map(enrollment => {
    const courseRaw = enrollment.courses
    const course = (Array.isArray(courseRaw) ? courseRaw[0] : courseRaw) as { title: string; slug: string } | null
    const courseSectionIds = sectionsByCourse[enrollment.course_id] ?? []
    const courseLessonIds = courseSectionIds.flatMap(sid => lessonsBySection[sid] ?? [])
    const totalLessons = courseLessonIds.length
    const completedLessons = courseLessonIds.filter(lid => completedIds.has(lid)).length
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    return {
      course_id: enrollment.course_id,
      title: course?.title ?? '',
      slug: course?.slug ?? '',
      enrolled_at: enrollment.enrolled_at,
      progress,
      completed_lessons: completedLessons,
      total_lessons: totalLessons,
    }
  })
}
