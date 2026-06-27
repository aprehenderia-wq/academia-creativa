import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSessionClient } from '@/lib/supabase/server'
import { getEnrolledCourses } from '@/lib/services/enrollments'
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

  const [profileResult, enrolledCourses] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    getEnrolledCourses(user.id),
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

        {/* Cursos o empty state */}
        {enrolledCourses.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 gap-6">
            <p className="font-serif text-h2 text-foreground">
              Aún no tienes cursos
            </p>
            <p className="text-body text-muted-foreground max-w-sm">
              Explora el catálogo y empieza tu primer curso de diseño.
            </p>
            <Link
              href="/"
              className="bg-primary-button hover:bg-primary-strong text-white text-small font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Ver catálogo
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
