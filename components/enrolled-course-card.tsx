import Link from 'next/link'
import Image from 'next/image'
import type { EnrolledCourse } from '@/lib/services/enrollments'

const CATEGORY_COLORS: Record<string, string> = {
  'Branding': '#0F6E56',
  'Ilustración': '#9A5F0F',
  'Motion graphics': '#534AB7',
}

function getCoverColor(category: string | null): string {
  if (!category) return '#C44D26'
  return CATEGORY_COLORS[category] ?? '#C44D26'
}

export function EnrolledCourseCard({ course }: { course: EnrolledCourse }) {
  const coverColor = getCoverColor(course.category)

  return (
    <article className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
      {/* Portada */}
      {course.cover_image ? (
        <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 10' }}>
          <Image
            src={course.cover_image}
            alt={`Portada del curso ${course.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div
          className="flex flex-col justify-end p-5"
          style={{ backgroundColor: coverColor, aspectRatio: '16 / 10' }}
        >
          <p className="font-serif font-semibold text-xl text-white leading-tight line-clamp-3">
            {course.title}
          </p>
        </div>
      )}

      {/* Cuerpo */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Barra de progreso */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-caption text-muted-foreground">Progreso</span>
            <span className="text-caption font-medium text-primary-strong">
              {course.progress}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-button rounded-full transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          {course.total_lessons > 0 && (
            <p className="text-caption text-muted-foreground">
              {course.completed_lessons} de {course.total_lessons} lecciones completadas
            </p>
          )}
        </div>

        <Link
          href={`/learn/${course.slug}`}
          className="mt-auto bg-primary-button hover:bg-primary-strong text-white text-small font-medium px-5 py-2.5 rounded-lg transition-colors text-center"
        >
          Ir al curso
        </Link>
      </div>
    </article>
  )
}
