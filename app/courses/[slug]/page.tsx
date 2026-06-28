import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getCourseWithCurriculum, getEnrollment } from '@/lib/services/courses'
import type { CourseSection } from '@/lib/services/courses'
import { createSessionClient } from '@/lib/supabase/server'
import { BuyButton } from '@/components/buy-button'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseWithCurriculum(slug)
  if (!course) return {}
  return {
    title: `${course.title} — Academia Creativa`,
    description: course.description ?? undefined,
  }
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

  const supabase = await createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isEnrolled = user
    ? await getEnrollment(user.id, course.id)
    : false

  const hasCurriculum = course.course_sections.length > 0
  const categoryLabel = course.category ?? 'Diseño'
  const bodyDescription = course.long_description ?? course.description
  const coverColor = getCoverColor(course.category)

  return (
    <main className="min-h-screen bg-background">

      {/* ── Portada ─────────────────────────────────────────────────────── */}
      <div className="relative flex flex-col justify-between px-6 py-10 lg:px-16 lg:py-16" style={{ minHeight: '300px' }}>
        {course.cover_image ? (
          <>
            <Image
              src={course.cover_image}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%)' }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: coverColor }} />
        )}
        <span className="relative z-10 font-sans text-caption font-medium uppercase tracking-widest text-white">
          {categoryLabel}
        </span>
        <h1 className="relative z-10 mt-6 font-serif font-semibold text-h1 text-white leading-tight lg:text-display lg:max-w-3xl">
          {course.title}
        </h1>
      </div>

      {/* ── Contenido ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">

          {/* Columna principal */}
          <div className="lg:col-span-2">

            {/* Metadatos: categoría, nivel, instructor */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="bg-terra-50 text-terra-700 text-caption font-medium px-2 py-1 rounded-md">
                {categoryLabel}
              </span>
              {course.level && (
                <span className="border border-border text-muted-foreground text-caption font-medium px-2 py-1 rounded-md">
                  {course.level}
                </span>
              )}
              {course.instructor_name && (
                <span className="text-small text-muted-foreground">
                  Instructor: <strong className="text-foreground">{course.instructor_name}</strong>
                </span>
              )}
            </div>

            {/* Descripción principal */}
            {bodyDescription && (
              <p className="text-base text-muted-foreground leading-relaxed mb-8">
                {bodyDescription}
              </p>
            )}

            {/* Precio + botón — solo en móvil */}
            <div className="flex items-center justify-between py-5 border-y border-border mb-10 lg:hidden">
              <span className="font-serif font-semibold text-h2 text-foreground">
                {formatPrice(course.price_cents, course.currency)}
              </span>
              <BuyButton
                courseId={course.id}
                courseSlug={course.slug}
                isEnrolled={isEnrolled}
                userId={user?.id ?? null}
                className="text-small px-6"
              />
            </div>

            {/* Lo que aprenderás */}
            {course.what_you_learn && course.what_you_learn.length > 0 && (
              <section className="mb-10">
                <h2 className="font-serif text-h2 font-medium text-foreground mb-4">
                  Lo que aprenderás
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.what_you_learn.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-small text-foreground">
                      <span className="shrink-0 text-primary-button font-semibold mt-px">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

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

          {/* Sidebar */}
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
              <BuyButton
                courseId={course.id}
                courseSlug={course.slug}
                isEnrolled={isEnrolled}
                userId={user?.id ?? null}
                className="w-full"
              />
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
          <div className="bg-terra-50 px-5 py-4">
            <p className="text-caption font-sans font-medium text-terra-700 uppercase tracking-wide mb-0.5">
              Módulo {sectionIndex + 1}
            </p>
            <h3 className="font-serif font-medium text-h3 text-foreground">
              {section.title}
            </h3>
          </div>

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
