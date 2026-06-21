import type { Metadata } from "next"
import { getPublishedCourses } from "@/lib/services/courses"
import { CourseCard } from "@/components/course-card"

export const metadata: Metadata = {
  title: "Cursos — Academia Creativa",
  description: "Explora nuestro catálogo de cursos de diseño.",
}

export default async function CoursesPage() {
  const courses = await getPublishedCourses()

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <h1 className="font-serif text-h1 font-semibold text-foreground">
            Cursos
          </h1>
          <p className="mt-2 text-small text-muted-foreground">
            Todo lo que necesitas para crecer como diseñador.
          </p>
        </header>

        {courses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-24 px-4">
      <p className="font-serif text-h2 font-medium text-foreground mb-3">
        Pronto habrá cursos aquí
      </p>
      <p className="text-small text-muted-foreground max-w-sm">
        Estamos preparando el catálogo. Vuelve pronto para descubrir nuestros
        primeros cursos de diseño.
      </p>
    </div>
  )
}
