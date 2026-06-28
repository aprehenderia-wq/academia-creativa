import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCourseWithCurriculum, getEnrollment } from '@/lib/services/courses'
import { createSessionClient } from '@/lib/supabase/server'
import { signLessonVideoUrl } from '@/lib/bunny'
import { getCertificateByUserAndCourse } from '@/lib/services/certificates'
import { Classroom } from './classroom'

async function getCompletedLessonIds(userId: string, lessonIds: string[]): Promise<string[]> {
  if (!lessonIds.length) return []
  const supabase = await createSessionClient()
  const { data } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds)
  return (data ?? []).map((r) => r.lesson_id)
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseWithCurriculum(slug)
  if (!course) return {}
  return {
    title: `Aula · ${course.title}`,
  }
}

// Página del aula: solo para alumnos con sesión y matrícula en el curso.
// El contenido de los vídeos se sirve mediante URLs firmadas (ver el
// componente cliente Classroom y la ruta /api/video/signed-url).
export default async function ClassroomPage({ params }: Props) {
  const { slug } = await params

  // 1. ¿Hay sesión? Si no, al login.
  const supabase = await createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 2. ¿Existe el curso (publicado)?
  const course = await getCourseWithCurriculum(slug)
  if (!course) notFound()

  // 3. ¿Está matriculado? Si no, lo enviamos a la página de venta a comprarlo.
  const isEnrolled = await getEnrollment(user.id, course.id)
  if (!isEnrolled) {
    redirect(`/courses/${slug}`)
  }

  // Pasamos al cliente solo lo necesario: nunca el video_id real, sino un
  // booleano "tiene vídeo". El id de la lección basta para pedir la URL firmada.
  const allLessonIds = course.course_sections.flatMap((s) => s.lessons.map((l) => l.id))
  const completedLessonIds = await getCompletedLessonIds(user.id, allLessonIds)

  const cert =
    allLessonIds.length > 0 && completedLessonIds.length >= allLessonIds.length
      ? await getCertificateByUserAndCourse(user.id, course.id)
      : null
  const initialCertificateId = cert?.id ?? null

  const sections = course.course_sections.map((section) => ({
    id: section.id,
    title: section.title,
    lessons: section.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      hasVideo: lesson.video_id !== null,
    })),
  }))

  const hasContent = sections.some((s) => s.lessons.length > 0)

  // Firmamos en el servidor la primera lección con vídeo, para que el aula
  // muestre el reproductor al instante, sin una llamada extra del navegador.
  // Las demás lecciones se firman bajo demanda al hacer clic (vía la API).
  const firstVideoLesson = course.course_sections
    .flatMap((s) => s.lessons)
    .find((l) => l.video_id !== null)

  let initialVideo: { lessonId: string; url: string } | null = null
  if (firstVideoLesson?.video_id) {
    try {
      initialVideo = {
        lessonId: firstVideoLesson.id,
        url: signLessonVideoUrl(firstVideoLesson.video_id),
      }
    } catch (err) {
      // Si falta configuración de Bunny, no rompemos el aula: el alumno verá
      // el mensaje de "no se pudo cargar" y el resto de la página funciona.
      console.error('[aula] No se pudo firmar el vídeo inicial:', err)
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Encabezado */}
        <header className="mb-8">
          <Link
            href="/dashboard"
            className="text-caption font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al panel
          </Link>
          <h1 className="mt-3 font-serif text-h1 text-foreground">{course.title}</h1>
        </header>

        {hasContent ? (
          <Classroom
            courseTitle={course.title}
            courseSlug={course.slug}
            sections={sections}
            initialVideo={initialVideo}
            completedLessonIds={completedLessonIds}
            initialCertificateId={initialCertificateId}
          />
        ) : (
          <div className="text-center py-16 px-4 border border-border rounded-xl">
            <p className="font-serif text-h3 font-medium text-foreground mb-2">
              El contenido se publica pronto
            </p>
            <p className="text-small text-muted-foreground">
              Estamos preparando las lecciones de este curso.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
