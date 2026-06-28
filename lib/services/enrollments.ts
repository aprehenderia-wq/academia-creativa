import 'server-only'
import { createSessionClient, createAdminClient } from '@/lib/supabase/server'

export type EnrolledCourse = {
  course_id: string
  title: string
  slug: string
  category: string | null
  cover_image: string | null
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
        slug,
        category,
        cover_image
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
    const course = (Array.isArray(courseRaw) ? courseRaw[0] : courseRaw) as { title: string; slug: string; category: string | null; cover_image: string | null } | null
    const courseSectionIds = sectionsByCourse[enrollment.course_id] ?? []
    const courseLessonIds = courseSectionIds.flatMap(sid => lessonsBySection[sid] ?? [])
    const totalLessons = courseLessonIds.length
    const completedLessons = courseLessonIds.filter(lid => completedIds.has(lid)).length
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    return {
      course_id: enrollment.course_id,
      title: course?.title ?? '',
      slug: course?.slug ?? '',
      category: course?.category ?? null,
      cover_image: course?.cover_image ?? null,
      enrolled_at: enrollment.enrolled_at,
      progress,
      completed_lessons: completedLessons,
      total_lessons: totalLessons,
    }
  })
}

export type InactiveStudent = {
  email: string
  studentName: string
  courseName: string
  courseUrl: string
}

export async function getInactiveStudents(): Promise<InactiveStudent[]> {
  const admin = createAdminClient()
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://academia-creativa-one.vercel.app'

  // 1. Matrículas de más de 14 días, con datos del curso
  // profiles se consulta por separado: no hay FK directa entre enrollments y profiles,
  // ambas apuntan a auth.users por separado y PostgREST no resuelve esa relación transitiva.
  const { data: enrollments, error } = await admin
    .from('enrollments')
    .select(`
      user_id,
      course_id,
      courses ( title, slug )
    `)
    .lt('enrolled_at', cutoff)

  if (error) throw new Error(`[inactividad] Error al consultar matrículas: ${error.message}`)
  if (!enrollments?.length) return []

  // 1b. Perfiles de los alumnos matriculados (consulta separada)
  const userIds = [...new Set(enrollments.map(e => e.user_id))]
  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds)

  if (profilesError) throw new Error(`[inactividad] Error al consultar perfiles: ${profilesError.message}`)

  const profileByUser: Record<string, { full_name?: string; email?: string }> = {}
  for (const p of profiles ?? []) profileByUser[p.id] = p

  // 2. Construir mapa lección → curso (necesario para vincular lesson_progress con cursos)
  const courseIds = [...new Set(enrollments.map(e => e.course_id))]

  const { data: sections } = await admin
    .from('course_sections')
    .select('id, course_id')
    .in('course_id', courseIds)

  const courseBySection: Record<string, string> = {}
  for (const s of sections ?? []) courseBySection[s.id] = s.course_id

  const sectionIds = Object.keys(courseBySection)
  const { data: lessons } = sectionIds.length
    ? await admin.from('lessons').select('id, section_id').in('section_id', sectionIds)
    : { data: [] as { id: string; section_id: string }[] }

  const lessonToCourse: Record<string, string> = {}
  for (const l of lessons ?? []) {
    const courseId = courseBySection[l.section_id]
    if (courseId) lessonToCourse[l.id] = courseId
  }

  // 3. Progreso reciente (últimos 14 días) para estos usuarios y lecciones
  const lessonIds = Object.keys(lessonToCourse)

  const { data: recentProgress } = userIds.length && lessonIds.length
    ? await admin
        .from('lesson_progress')
        .select('user_id, lesson_id')
        .in('user_id', userIds)
        .in('lesson_id', lessonIds)
        .gte('completed_at', cutoff)
    : { data: [] as { user_id: string; lesson_id: string }[] }

  // Par "userId:courseId" con actividad reciente → estos alumnos NO son inactivos
  const activeSet = new Set<string>()
  for (const p of recentProgress ?? []) {
    const courseId = lessonToCourse[p.lesson_id]
    if (courseId) activeSet.add(`${p.user_id}:${courseId}`)
  }

  // 4. Filtrar: solo los que NO tienen actividad reciente
  return enrollments.flatMap(e => {
    if (activeSet.has(`${e.user_id}:${e.course_id}`)) return []

    const profile = profileByUser[e.user_id] ?? null
    const course = (Array.isArray(e.courses) ? e.courses[0] : e.courses) as
      | { title?: string; slug?: string }
      | null

    const email = profile?.email ?? ''
    if (!email) return []

    return [{
      email,
      studentName: profile?.full_name ?? 'alumno/a',
      courseName: course?.title ?? '',
      courseUrl: course?.slug
        ? `${siteUrl}/courses/${course.slug}`
        : `${siteUrl}/dashboard`,
    }]
  })
}
