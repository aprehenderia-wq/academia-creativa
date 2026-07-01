import type { Metadata } from "next"
import { Suspense } from "react"
import Image from "next/image"
import { getPublishedCourses } from "@/lib/services/courses"
import { CourseCard } from "@/components/course-card"
import { FadeIn } from "@/components/fade-in"
import { QueryToast } from "@/components/query-toast"

export const metadata: Metadata = {
  title: {
    absolute: 'Academia Creativa — Cursos de diseño digital',
  },
  description:
    'Cursos prácticos de diseño gráfico, branding, ilustración y motion graphics. Aprende las herramientas y el criterio para crear trabajo profesional que conecta.',
}

export default async function HomePage() {
  const courses = await getPublishedCourses()

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <QueryToast param="registered" message="¡Cuenta creada! Bienvenido/a a Academia Creativa" />
      </Suspense>

      {/* ── HERO ── */}
      <section
        id="hero"
        className="px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-20"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Columna izquierda — texto */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-6">
            {/* Badge */}
            <span className="font-sans text-caption font-medium uppercase tracking-widest px-3 py-1 rounded-md bg-success-bg text-accent">
              Nueva temporada · 2026
            </span>

            {/* Titular */}
            <h1 className="font-serif text-display font-semibold text-foreground sm:text-[3.5rem] sm:leading-[1.1]">
              Aprende a diseñar con intención
            </h1>

            {/* Subtítulo */}
            <p className="font-sans text-body text-muted-foreground max-w-xl lg:max-w-none">
              Cursos prácticos de diseño gráfico, branding, ilustración y motion
              graphics. Aprende las herramientas y el criterio para crear trabajo
              profesional que conecta.
            </p>

            {/* Botón CTA */}
            <a
              href="#catalogo"
              className="font-sans font-medium text-white text-small px-7 py-3 rounded-md transition-all duration-200 bg-primary-button hover:bg-primary-strong hover:shadow-md active:scale-95"
            >
              Explorar cursos
            </a>

            {/* Estadísticas */}
            <div className="w-full mt-2 flex flex-col sm:flex-row gap-px rounded-xl overflow-hidden border border-border">
              {[
                { value: "2.4k+", label: "alumnos", color: "#D85A30" },
                { value: "4.9", label: "valoración media", color: "#0F6E56" },
                { value: "12", label: "cursos", color: "#9A5F0F" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center py-5 px-4 gap-1 bg-terra-50"
                >
                  <span className="font-serif font-semibold text-h3 leading-none" style={{ color: stat.color }}>
                    {stat.value}
                  </span>
                  <span className="font-sans text-small text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha — imagen */}
          <div className="w-full">
            <Image
              src="/images/hero-studio.png"
              alt="Estudio de diseño de Academia Creativa"
              width={720}
              height={540}
              priority
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>

        </div>
      </section>

      {/* ── CATÁLOGO ── */}
      <section
        id="catalogo"
        className="px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="max-w-6xl mx-auto">
          <header className="mb-10">
            <h2 className="font-serif text-h1 font-semibold text-foreground">
              Cursos
            </h2>
            <div className="w-24 h-[3px] bg-accent rounded-full mt-3" />
            <p className="mt-3 text-small text-muted-foreground">
              Todo lo que necesitas para crecer como diseñador.
            </p>
          </header>

          {courses.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <FadeIn key={course.id} delay={i * 80} className="h-full">
                  <CourseCard course={course} />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
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
