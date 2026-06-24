import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCourseWithCurriculum } from '@/lib/services/courses'
import type { CourseSection } from '@/lib/services/courses'

type Props = {
  params: Promise<{ slug: string }>
}

// Genera el <title> de la pestaña con el nombre real del curso.
// Como usa la misma función que el componente de página, React.cache evita
// que se hagan dos consultas a Supabase.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseWithCurriculum(slug)
  if (!course) return {}
  return {
    title: `${course.title} — Academia Creativa`,
    description: course.description ?? undefined,
  }
}

// Color y etiqueta provisionales hasta que exista la columna `category` en la BD.
const COVER_COLOR = '#C44D26'
const CATEGORY_LABEL = 'Diseño'

function formatPrice(cents: number, currency: string): string {
  if (cents === 0) return 'Gratis'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params
  const course = await getCourseWithCurriculum(slug)

  if (!course) notFound()

  const hasCurriculum = course.course_sections.length > 0

  return (
    <main className="min-h-screen bg-background">

      {/* ── Portada tipográfica ──────────────────────────────────────────── */}
      <div
        className="flex flex-col justify-between px-6 py-10 lg:px-16 lg:py-16"
        style={{ backgroundColor: COVER_COLOR, minHeight: '260px' }}
      >
        <span className="font-sans text-caption font-medium uppercase tracking-widest text-white">
          {CATEGORY_LABEL}
        </span>
        <h1 className="mt-6 font-serif font-semibold text-h1 text-white leading-tight lg:text-display lg:max-w-3xl">
          {course.title}
        </h1>
      </div>

      {/* ── Contenido ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">

          {/* Columna principal (izquierda en desktop) */}
          <div className="lg:col-span-2">

            {/* Badge + descripción */}
            <div className="flex flex-col gap-4 mb-8">
              <span className="self-start bg-terra-50 text-terra-700 text-caption font-medium px-2 py-1 rounded-md">
                {CATEGORY_LABEL}
              </span>
              {course.description && (
                <p className="text-base text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              )}
            </div>

            {/* Precio + botón "Comprar" — visible solo en móvil.
                En desktop aparece en el sidebar de la derecha. */}
            <div className="flex items-center justify-between py-5 border-y border-border mb-10 lg:hidden">
              <span className="font-serif font-semibold text-h2 text-foreground">
                {formatPrice(course.price_cents, course.currency)}
              </span>
              <button
                type="button"
                className="bg-primary-button hover:bg-primary-strong text-white text-small font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Comprar
              </button>
            </div>

            {/* Temario */}
            <section aria-label="Temario del curso">
              <h2 className="font-serif text-h2 font-medium text-foreground mb-6">
                Temario
              </h2>

              {hasCurriculum ? (
                <CurriculumList sections={course.course_sections} />
              ) : (
                <EmptyCurriculum />
              )}
            </section>
          </div>

          {/* Sidebar (derecha en desktop, oculto en móvil) */}
          <aside className="hidden lg:block" aria-label="Precio y compra">
            <div className="sticky top-8 border border-border rounded-xl p-6 bg-card flex flex-col gap-5">
              <div>
                <p className="text-caption font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Precio
                </p>
                <span className="font-serif font-semibold text-display text-foreground">
                  {formatPrice(course.price_cents, course.currency)}
                </span>
              </div>
              <button
                type="button"
                className="w-full bg-primary-button hover:bg-primary-strong text-white font-medium py-3 rounded-lg transition-colors"
              >
                Comprar
              </button>
              <p className="text-caption text-muted-foreground text-center">
                Acceso de por vida al comprarlo
              </p>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}

// ── Subcomponentes ───────────────────────────────────────────────────────────

function CurriculumList({ sections }: { sections: CourseSection[] }) {
  return (
    <div className="flex flex-col gap-4">
      {sections.map((section, sectionIndex) => (
        <div
          key={section.id}
          className="border border-border rounded-xl overflow-hidden"
        >
          {/* Cabecera de sección */}
          <div className="bg-terra-50 px-5 py-4">
            <p className="text-caption font-sans font-medium text-terra-700 uppercase tracking-wide mb-0.5">
              Módulo {sectionIndex + 1}
            </p>
            <h3 className="font-serif font-medium text-h3 text-foreground">
              {section.title}
            </h3>
          </div>

          {/* Lecciones */}
          <ul className="divide-y divide-border">
            {section.lessons.map((lesson, lessonIndex) => (
              <li key={lesson.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="shrink-0 w-6 h-6 rounded-full bg-terra-50 text-terra-700 text-caption font-medium flex items-center justify-center">
                  {lessonIndex + 1}
                </span>
                <span className="text-small text-foreground">{lesson.title}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function EmptyCurriculum() {
  return (
    <div className="text-center py-16 px-4 border border-border rounded-xl">
      <p className="font-serif text-h3 font-medium text-foreground mb-2">
        El temario se publica pronto
      </p>
      <p className="text-small text-muted-foreground">
        Estamos preparando el contenido de este curso.
      </p>
    </div>
  )
}
