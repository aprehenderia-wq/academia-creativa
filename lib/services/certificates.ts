import 'server-only'
import { createAdminClient, createSessionClient } from '@/lib/supabase/server'

export type Certificate = {
  id: string
  course_id: string
  certificate_code: string
  issued_at: string
  course_title: string
  student_name: string
}

function generateCode(): string {
  const year = new Date().getFullYear()
  const hex = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()
  return `ACAD-${year}-${hex}`
}

/**
 * Emite un certificado para un alumno en un curso.
 * Usa service_role (como enrollments) porque la inserción no está permitida
 * desde el navegador. Si el certificado ya existía, devuelve el ID existente.
 */
export async function issueCertificate(
  userId: string,
  courseId: string
): Promise<string | null> {
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('certificates')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()

  if (existing) return existing.id

  const { data, error } = await admin
    .from('certificates')
    .insert({ user_id: userId, course_id: courseId, certificate_code: generateCode() })
    .select('id')
    .single()

  if (error) return null
  return data.id
}

/**
 * Busca el certificado de un alumno para un curso específico.
 * Devuelve null si no existe.
 */
export async function getCertificateByUserAndCourse(
  userId: string,
  courseId: string
): Promise<{ id: string } | null> {
  const supabase = await createSessionClient()
  const { data } = await supabase
    .from('certificates')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()
  return data ?? null
}

/**
 * Devuelve todos los certificados del alumno con el título del curso.
 * Usado en el dashboard.
 */
export async function getUserCertificates(userId: string): Promise<Certificate[]> {
  const supabase = await createSessionClient()

  const { data: certs } = await supabase
    .from('certificates')
    .select('id, course_id, certificate_code, issued_at, courses(title)')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false })

  if (!certs?.length) return []

  // profiles no tiene FK directa desde certificates; consultamos por separado
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle()

  const studentName = profile?.full_name ?? ''

  return certs.map((cert) => {
    const course = Array.isArray(cert.courses) ? cert.courses[0] : cert.courses
    return {
      id: cert.id,
      course_id: cert.course_id,
      certificate_code: cert.certificate_code,
      issued_at: cert.issued_at,
      course_title: (course as { title?: string } | null)?.title ?? '',
      student_name: studentName,
    }
  })
}

/**
 * Busca un certificado por ID y verifica que pertenezca al usuario.
 * Devuelve también el nombre del alumno y el título del curso para el PDF.
 */
export async function getCertificateForDownload(
  certificateId: string,
  userId: string
): Promise<{
  id: string
  certificate_code: string
  issued_at: string
  course_title: string
  student_name: string
} | null> {
  const supabase = await createSessionClient()

  const { data: cert } = await supabase
    .from('certificates')
    .select('id, certificate_code, issued_at, courses(title)')
    .eq('id', certificateId)
    .eq('user_id', userId)
    .single()

  if (!cert) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle()

  const course = Array.isArray(cert.courses) ? cert.courses[0] : cert.courses

  return {
    id: cert.id,
    certificate_code: cert.certificate_code,
    issued_at: cert.issued_at,
    course_title: (course as { title?: string } | null)?.title ?? '',
    student_name: profile?.full_name ?? 'Alumno/a',
  }
}
