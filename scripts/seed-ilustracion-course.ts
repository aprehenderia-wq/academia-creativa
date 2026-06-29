/**
 * Script de una sola ejecución para insertar el curso "Ilustración digital con Procreate".
 * Ejecutar con: npx tsx --env-file=.env.local scripts/seed-ilustracion-course.ts
 */
import { createClient } from '@supabase/supabase-js'

const SLUG = 'ilustracion-digital-procreate'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // ── 1. Insertar curso ──────────────────────────────────────────────────────
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      title: 'Ilustración digital con Procreate',
      slug: SLUG,
      description:
        'Aprende a ilustrar desde cero con Procreate, desde el trazo básico hasta la composición de una pieza editorial completa.',
      price_cents: 19700,
      currency: 'eur',
      status: 'published',
    })
    .select('id')
    .single()

  if (courseError) {
    console.error('Error al insertar curso:', courseError.message)
    process.exit(1)
  }

  console.log(`✓ Curso insertado (id: ${course.id})`)

  // ── 2. Insertar secciones ──────────────────────────────────────────────────
  const sections = [
    { title: 'Fundamentos del dibujo digital', position: 1 },
    { title: 'Color y composición',             position: 2 },
    { title: 'Técnicas de textura y estilo',    position: 3 },
    { title: 'Proyecto final: ilustración editorial', position: 4 },
  ]

  const { data: insertedSections, error: sectionsError } = await supabase
    .from('course_sections')
    .insert(sections.map((s) => ({ ...s, course_id: course.id })))
    .select('id, position')

  if (sectionsError) {
    console.error('Error al insertar secciones:', sectionsError.message)
    process.exit(1)
  }

  console.log(`✓ ${insertedSections.length} secciones insertadas`)

  const sectionById = Object.fromEntries(
    insertedSections.map((s) => [s.position, s.id])
  )

  // ── 3. Insertar lecciones por sección ─────────────────────────────────────
  const lessonsBySectionPosition: Record<number, { title: string; position: number }[]> = {
    1: [
      { title: 'Introducción a Procreate y su interfaz',          position: 1 },
      { title: 'Pinceles esenciales y configuración',             position: 2 },
      { title: 'El trazo: presión, velocidad y control',          position: 3 },
      { title: 'Formas básicas y construcción de figuras',        position: 4 },
      { title: 'Ejercicio: boceto rápido de objetos cotidianos',  position: 5 },
    ],
    2: [
      { title: 'Teoría del color para ilustración',              position: 1 },
      { title: 'Paletas de color: cómo crear y usar',            position: 2 },
      { title: 'Composición y jerarquía visual',                 position: 3 },
      { title: 'Ejercicio: ilustración monocromática',           position: 4 },
    ],
    3: [
      { title: 'Texturas digitales que parecen analógicas',      position: 1 },
      { title: 'Luz, sombra y volumen',                          position: 2 },
      { title: 'Encontrar tu estilo: referentes y experimentación', position: 3 },
      { title: 'Ejercicio: pieza con textura editorial',         position: 4 },
    ],
    4: [
      { title: 'Briefing y conceptualización',                   position: 1 },
      { title: 'Desarrollo de la pieza paso a paso',             position: 2 },
      { title: 'Exportación y entrega profesional',              position: 3 },
    ],
  }

  let totalLessons = 0
  for (const [pos, lessons] of Object.entries(lessonsBySectionPosition)) {
    const sectionId = sectionById[Number(pos)]
    const { error: lessonsError } = await supabase
      .from('lessons')
      .insert(lessons.map((l) => ({ ...l, section_id: sectionId })))

    if (lessonsError) {
      console.error(`Error en sección ${pos}:`, lessonsError.message)
      process.exit(1)
    }
    totalLessons += lessons.length
  }

  console.log(`✓ ${totalLessons} lecciones insertadas`)
  console.log(`\n✅ Listo. Curso visible en /courses/${SLUG}`)
}

main()
