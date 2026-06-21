import Link from "next/link"
import type { Course } from "@/lib/services/courses"

function formatPrice(cents: number, currency: string): string {
  if (cents === 0) return "Gratis"
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

// Color y etiqueta provisionales hasta que exista la columna `category` en la BD.
// Cuando se añada, reemplazar estas constantes por una función que mapee
// la categoría al color correspondiente del sistema de diseño.
const COVER_COLOR = "#C44D26"
const CATEGORY_LABEL = "Diseño"

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
      {/* Portada tipográfica */}
      <div
        className="flex flex-col justify-between p-5"
        style={{ backgroundColor: COVER_COLOR, aspectRatio: "16 / 10" }}
      >
        <span className="font-sans text-caption font-medium uppercase tracking-widest text-white">
          {CATEGORY_LABEL}
        </span>
        <p className="font-serif font-semibold text-xl text-white leading-tight line-clamp-3">
          {course.title}
        </p>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <span className="self-start bg-terra-50 text-terra-700 text-caption font-medium px-2 py-1 rounded-md">
          {CATEGORY_LABEL}
        </span>

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
            className="bg-primary-button hover:bg-primary-strong text-white text-small font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Ver curso
          </Link>
        </div>
      </div>
    </article>
  )
}
