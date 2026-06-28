import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'

// ── Estadísticas del dashboard ────────────────────────────────────────────────

export type AdminStats = {
  publishedCourses: number
  totalStudents: number
  activeEnrollments: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createAdminClient()

  const [coursesRes, studentsRes, enrollmentsRes] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }),
  ])

  return {
    publishedCourses: coursesRes.count ?? 0,
    totalStudents: studentsRes.count ?? 0,
    activeEnrollments: enrollmentsRes.count ?? 0,
  }
}

// ── Lista de alumnos ──────────────────────────────────────────────────────────

export type AdminStudent = {
  id: string
  full_name: string | null
  email: string | null
  course_count: number
  course_titles: string[]
  latest_enrollment: string | null
}

export async function getAdminStudents(): Promise<AdminStudent[]> {
  const supabase = createAdminClient()

  const [profilesRes, enrollmentsRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email').order('created_at', { ascending: false }),
    supabase.from('enrollments').select('user_id, enrolled_at, courses ( title )').order('enrolled_at', { ascending: false }),
  ])

  const profiles = profilesRes.data ?? []
  const enrollments = enrollmentsRes.data ?? []

  const enrollmentMap = new Map<string, { count: number; latest: string; titles: string[] }>()

  for (const e of enrollments) {
    const course = e.courses as { title: string } | null
    const existing = enrollmentMap.get(e.user_id)
    if (existing) {
      existing.count++
      if (course) existing.titles.push(course.title)
    } else {
      enrollmentMap.set(e.user_id, {
        count: 1,
        latest: e.enrolled_at,
        titles: course ? [course.title] : [],
      })
    }
  }

  return profiles.map((p) => {
    const info = enrollmentMap.get(p.id)
    return {
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      course_count: info?.count ?? 0,
      course_titles: info?.titles ?? [],
      latest_enrollment: info?.latest ?? null,
    }
  })
}

// ── Lista de cursos ───────────────────────────────────────────────────────────

export type AdminCourse = {
  id: string
  title: string
  category: string | null
  price_cents: number
  currency: string
  status: string
  enrollment_count: number
}

export async function getAdminCourses(): Promise<AdminCourse[]> {
  const supabase = createAdminClient()

  const [coursesRes, enrollmentsRes] = await Promise.all([
    supabase.from('courses').select('id, title, category, price_cents, currency, status').order('created_at', { ascending: false }),
    supabase.from('enrollments').select('course_id'),
  ])

  const courses = coursesRes.data ?? []
  const enrollments = enrollmentsRes.data ?? []

  const countMap = enrollments.reduce<Record<string, number>>((acc, e) => {
    acc[e.course_id] = (acc[e.course_id] ?? 0) + 1
    return acc
  }, {})

  return courses.map((c) => ({ ...c, enrollment_count: countMap[c.id] ?? 0 }))
}

// ── Creación de curso ─────────────────────────────────────────────────────────

export type CourseInput = {
  title: string
  slug: string
  price_cents: number
  currency: string
  description: string
  long_description?: string | null
  category?: string | null
  level?: string | null
  instructor_name?: string | null
  status: 'draft' | 'published'
}

export async function createCourse(
  input: CourseInput
): Promise<{ data: AdminCourse | null; error: string | null }> {
  const supabase = createAdminClient()

  // Check slug uniqueness
  const { data: existing, error: slugError } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', input.slug)
    .maybeSingle()

  if (slugError) return { data: null, error: slugError.message }
  if (existing) return { data: null, error: 'El slug ya está en uso. Elige otro.' }

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title: input.title,
      slug: input.slug,
      price_cents: input.price_cents,
      currency: input.currency,
      description: input.description,
      long_description: input.long_description ?? null,
      category: input.category ?? null,
      level: input.level ?? null,
      instructor_name: input.instructor_name ?? null,
      status: input.status,
    })
    .select('id, title, category, price_cents, currency, status')
    .single()

  if (error) return { data: null, error: error.message }

  return { data: { ...data, enrollment_count: 0 }, error: null }
}

// ── Transacciones recientes ───────────────────────────────────────────────────

export type AdminTransaction = {
  id: string
  student_name: string | null
  student_email: string | null
  course_title: string
  price_cents: number
  currency: string
  enrolled_at: string
}

export async function getAdminTransactions(): Promise<AdminTransaction[]> {
  const supabase = createAdminClient()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, user_id, enrolled_at, courses ( title, price_cents, currency )')
    .order('enrolled_at', { ascending: false })
    .limit(100)

  if (!enrollments?.length) return []

  const userIds = [...new Set(enrollments.map((e) => e.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds)

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  return enrollments.map((e) => {
    const course = e.courses as { title: string; price_cents: number; currency: string } | null
    const profile = profileMap.get(e.user_id)
    return {
      id: e.id,
      student_name: profile?.full_name ?? null,
      student_email: profile?.email ?? null,
      course_title: course?.title ?? '—',
      price_cents: course?.price_cents ?? 0,
      currency: course?.currency ?? 'eur',
      enrolled_at: e.enrolled_at,
    }
  })
}
