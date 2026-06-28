'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'

// ============================================================================
// Reproductor del aula (lado cliente)
// ----------------------------------------------------------------------------
// Muestra la lista de lecciones y un reproductor. El primer vídeo llega ya
// firmado desde el servidor (initialVideo), para que cargue al instante.
// Al hacer clic en otra lección con vídeo, pide su URL firmada a
// /api/video/signed-url. Maneja "cargando", "sin vídeo" (404) y "sin acceso"
// (403) con mensajes claros para el alumno.
// ============================================================================

export type ClassroomLesson = {
  id: string
  title: string
  hasVideo: boolean
}

export type ClassroomSection = {
  id: string
  title: string
  lessons: ClassroomLesson[]
}

type Status = 'idle' | 'loading' | 'ready' | 'error'

export function Classroom({
  courseTitle,
  courseSlug,
  sections,
  initialVideo,
}: {
  courseTitle: string
  courseSlug: string
  sections: ClassroomSection[]
  initialVideo: { lessonId: string; url: string } | null
}) {
  const allLessons = sections.flatMap((s) => s.lessons)
  const initialLesson =
    (initialVideo && allLessons.find((l) => l.id === initialVideo.lessonId)) ||
    allLessons[0] ||
    null

  const [selectedId, setSelectedId] = useState<string | null>(initialLesson?.id ?? null)
  const [status, setStatus] = useState<Status>(
    initialVideo ? 'ready' : initialLesson ? 'error' : 'idle'
  )
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideo?.url ?? null)
  const [message, setMessage] = useState<string | null>(
    initialVideo || !initialLesson
      ? null
      : 'Esta lección todavía no tiene video disponible.'
  )

  // Cada petición lleva un número. Si el alumno cambia de lección antes de que
  // llegue la respuesta anterior, descartamos la vieja (evita "saltos" de vídeo).
  const requestRef = useRef(0)

  const selectedLesson = allLessons.find((l) => l.id === selectedId) ?? null

  async function loadLesson(lesson: ClassroomLesson) {
    setSelectedId(lesson.id)
    setVideoUrl(null)
    setMessage(null)

    // Si ya sabemos que la lección no tiene vídeo, no llamamos a la API.
    if (!lesson.hasVideo) {
      setStatus('error')
      setMessage('Esta lección todavía no tiene video disponible.')
      return
    }

    const reqId = ++requestRef.current
    setStatus('loading')

    try {
      const res = await fetch(
        `/api/video/signed-url?lesson_id=${encodeURIComponent(lesson.id)}`,
        { cache: 'no-store' }
      )

      // Llegó una petición más nueva: ignoramos esta respuesta.
      if (reqId !== requestRef.current) return

      if (res.ok) {
        const data = (await res.json()) as { url: string }
        if (reqId !== requestRef.current) return
        setVideoUrl(data.url)
        setStatus('ready')
        return
      }

      if (res.status === 403) {
        setMessage('Necesitas comprar este curso para ver el video.')
      } else if (res.status === 404) {
        setMessage('Esta lección todavía no tiene video disponible.')
      } else if (res.status === 401) {
        setMessage('Tu sesión expiró. Vuelve a iniciar sesión para continuar.')
      } else {
        setMessage('No se pudo cargar el video. Inténtalo de nuevo en un momento.')
      }
      setStatus('error')
    } catch {
      if (reqId !== requestRef.current) return
      setStatus('error')
      setMessage('No se pudo cargar el video. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-10">
      {/* ── Reproductor (columna principal) ─────────────────────────────── */}
      <div className="lg:col-span-2">
        {selectedLesson && (
          <p className="font-serif text-h3 text-foreground mb-4">
            {selectedLesson.title}
          </p>
        )}

        <div className="aspect-video w-full rounded-xl overflow-hidden bg-foreground/90 relative">
          {status === 'loading' && <PlayerSkeleton />}

          {status === 'ready' && videoUrl && (
            <iframe
              key={videoUrl}
              src={videoUrl}
              title={selectedLesson?.title ?? courseTitle}
              loading="lazy"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              allowFullScreen
            />
          )}

          {status === 'error' && (
            <PlayerMessage
              message={message}
              showBuyLink={message?.includes('comprar') ?? false}
              courseSlug={courseSlug}
            />
          )}
        </div>
      </div>

      {/* ── Lista de lecciones (barra lateral) ──────────────────────────── */}
      <aside className="mt-8 lg:mt-0" aria-label="Lecciones del curso">
        <h2 className="font-serif text-h3 text-foreground mb-4">Contenido</h2>
        <div className="flex flex-col gap-5">
          {sections.map((section, sectionIndex) => (
            <div key={section.id}>
              <p className="text-caption font-medium text-terra-700 uppercase tracking-wide mb-2">
                Módulo {sectionIndex + 1} · {section.title}
              </p>
              <ul className="flex flex-col gap-1">
                {section.lessons.map((lesson) => {
                  const isSelected = lesson.id === selectedId
                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        onClick={() => loadLesson(lesson)}
                        aria-current={isSelected}
                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-small transition-colors ${
                          isSelected
                            ? 'bg-terra-50 text-terra-700 font-medium'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <LessonIcon hasVideo={lesson.hasVideo} active={isSelected} />
                        <span className="flex-1">{lesson.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function PlayerSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span
        className="h-10 w-10 rounded-full border-2 border-white/30 border-t-white animate-spin"
        role="status"
        aria-label="Cargando video"
      />
    </div>
  )
}

function PlayerMessage({
  message,
  showBuyLink,
  courseSlug,
}: {
  message: string | null
  showBuyLink: boolean
  courseSlug: string
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-small text-white/90 max-w-xs">
        {message ?? 'No se pudo cargar el video.'}
      </p>
      {showBuyLink && (
        <Link
          href={`/courses/${courseSlug}`}
          className="bg-primary-button hover:bg-primary-strong text-white text-small font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Ver el curso
        </Link>
      )}
    </div>
  )
}

function LessonIcon({ hasVideo, active }: { hasVideo: boolean; active: boolean }) {
  // Triángulo "play" para lecciones con vídeo; punto tenue para las que no.
  if (!hasVideo) {
    return <span className="shrink-0 h-2 w-2 rounded-full bg-muted-foreground/40" aria-hidden />
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 h-4 w-4 ${active ? 'text-terra-700' : 'text-muted-foreground'}`}
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
