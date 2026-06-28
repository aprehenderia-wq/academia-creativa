import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSessionClient } from '@/lib/supabase/server'
import { getEnrolledCourses } from '@/lib/services/enrollments'
import { getUserCertificates } from '@/lib/services/certificates'
import { EnrolledCourseCard } from '@/components/enrolled-course-card'

export const metadata = {
  title: 'Panel del alumno — Academia Creativa',
}

export default async function DashboardPage() {
  const supabase = await createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [profileResult, enrolledCourses, certificates] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    getEnrolledCourses(user.id),
    getUserCertificates(user.id),
  ])

  const displayName = profileResult.data?.full_name
  const greeting = displayName ? `Bienvenida, ${displayName}` : 'Bienvenido/a'

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">

        {/* Encabezado */}
        <header className="mb-10">
          <p className="text-caption font-medium text-primary-strong uppercase tracking-widest mb-2">
            Panel del alumno
          </p>
          <h1 className="font-serif text-h1 text-foreground">
            {greeting}
          </h1>
        </header>

        {/* Certificados */}
        <section className="mb-12">
          <h2 className="font-serif text-h2 text-foreground mb-6">Mis certificados</h2>
          {certificates.length > 0 ? (
            <div className="flex flex-col gap-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-card px-5 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{cert.course_title}</p>
                    <p className="text-caption text-muted-foreground mt-0.5">
                      Emitido el{' '}
                      {new Date(cert.issued_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {' · '}
                      <span className="font-mono">{cert.certificate_code}</span>
                    </p>
                  </div>
                  <a
                    href={`/api/certificates/${cert.id}/download`}
                    download
                    className="shrink-0 flex items-center gap-2 rounded-lg border border-terra-600 px-4 py-2 text-small font-medium text-terra-700 transition-colors hover:bg-terra-50"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-3.5-3.5M12 16l3.5-3.5M4 20h16" />
                    </svg>
                    Descargar PDF
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-small text-muted-foreground">
              Completá todas las lecciones de un curso para obtener tu certificado.
            </p>
          )}
        </section>

        {/* Cursos o empty state */}
        {enrolledCourses.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 gap-6">
            <p className="font-serif text-h2 text-foreground">
              Todavía no tenés cursos
            </p>
            <p className="text-body text-muted-foreground max-w-sm">
              Explorá el catálogo y empezá tu primer curso.
            </p>
            <Link
              href="/#catalogo"
              className="bg-primary-button hover:bg-primary-strong text-white text-small font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Ver cursos
            </Link>
          </div>
        ) : (
          <>
            <p className="text-small text-muted-foreground mb-6">
              {enrolledCourses.length === 1
                ? '1 curso matriculado'
                : `${enrolledCourses.length} cursos matriculados`}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map(course => (
                <EnrolledCourseCard key={course.course_id} course={course} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
