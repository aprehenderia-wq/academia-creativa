import Link from 'next/link'
import Image from 'next/image'
import type { Course } from '@/lib/services/courses'

function formatPrice(cents: number, currency: string): string {
  if (cents === 0) return 'Gratis'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

const CATEGORY_COLORS: Record<string, string> = {
  'Branding': '#0F6E56',
  'Ilustración': '#9A5F0F',
  'Motion graphics': '#534AB7',
}

function getCoverColor(category: string | null): string {
  if (!category) return '#C44D26'
  return CATEGORY_COLORS[category] ?? '#C44D26'
}

export function CourseCard({ course }: { course: Course }) {
  const categoryLabel = course.category ?? 'Diseño'
  const coverColor = getCoverColor(course.category)

  return (
    <article className="bg-card rounded-xl border border-border flex flex-col overflow-hidden h-full transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg">
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
          <span className="absolute top-4 left-4 text-caption font-medium uppercase tracking-widest text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
            {categoryLabel}
          </span>
        </div>
      ) : (
        <div
          className="flex flex-col justify-between p-5"
          style={{ backgroundColor: coverColor, aspectRatio: '16 / 10' }}
        >
          <span className="font-sans text-caption font-medium uppercase tracking-widest text-white">
            {categoryLabel}
          </span>
          <p className="font-serif font-semibold text-xl text-white leading-tight line-clamp-3">
            {course.title}
          </p>
        </div>
      )}

      {/* Cuerpo de la tarjeta */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-terra-50 text-terra-700 text-caption font-medium px-2 py-1 rounded-md">
            {categoryLabel}
          </span>
          {course.level && (
            <span className="border border-border text-muted-foreground text-caption font-medium px-2 py-1 rounded-md">
              {course.level}
            </span>
          )}
        </div>

        <h2 className="font-serif font-medium text-h3 text-foreground line-clamp-2">
          {course.title}
        </h2>

        {course.description ? (
          <p className="text-small text-muted-foreground line-clamp-2 flex-1">
            {course.description}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
          <span className="font-serif font-semibold text-h3 text-foreground">
            {formatPrice(course.price_cents, course.currency)}
          </span>
          <Link
            href={`/courses/${course.slug}`}
            className="bg-primary-button hover:bg-primary-strong hover:shadow-md active:scale-95 text-white text-small font-medium px-5 py-2.5 rounded-lg transition-all duration-200"
          >
            Ver curso
          </Link>
        </div>
      </div>
    </article>
  )
}
