import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createSessionClient } from '@/lib/supabase/server'
import { signLessonVideoUrl } from '@/lib/bunny'

// Necesitamos el runtime de Node porque el firmado usa el módulo 'crypto'.
export const runtime = 'nodejs'

// GET /api/video/signed-url?lesson_id=<uuid>
// Devuelve una URL firmada del iframe de Bunny para la lección indicada,
// solo si el usuario tiene sesión y está matriculado en el curso.
export async function GET(request: NextRequest) {
  const lessonId = request.nextUrl.searchParams.get('lesson_id')
  if (!lessonId) {
    return NextResponse.json({ error: 'Falta el parámetro lesson_id.' }, { status: 400 })
  }

  // 1. ¿Hay sesión? Usamos el cliente con cookies (anon key), que respeta RLS.
  const supabase = await createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Necesitas iniciar sesión para ver el video.' },
      { status: 401 }
    )
  }

  // 2. Leemos la lección con el cliente de sesión. La política RLS de `lessons`
  //    SOLO devuelve la fila si el usuario está matriculado en el curso al que
  //    pertenece la lección. Por eso:
  //      - Si NO hay fila  → o no existe o no está matriculado. Por seguridad,
  //        no revelamos cuál de las dos: respondemos 403 ("compra el curso").
  //      - Si SÍ hay fila pero sin video_id → la lección no tiene vídeo (404).
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('id, video_id')
    .eq('id', lessonId)
    .maybeSingle()

  if (error) {
    console.error('[signed-url] Error al consultar la lección:', error.message)
    return NextResponse.json(
      { error: 'Error al consultar la lección.' },
      { status: 500 }
    )
  }

  if (!lesson) {
    return NextResponse.json(
      { error: 'Necesitas comprar el curso para ver este video.' },
      { status: 403 }
    )
  }

  if (!lesson.video_id) {
    return NextResponse.json(
      { error: 'Esta lección todavía no tiene video disponible.' },
      { status: 404 }
    )
  }

  // 3. Generamos la URL firmada (válida 4 horas).
  let url: string
  try {
    url = signLessonVideoUrl(lesson.video_id)
  } catch (err) {
    console.error('[signed-url] Configuración de Bunny incompleta:', err)
    return NextResponse.json(
      { error: 'El servicio de video no está configurado.' },
      { status: 500 }
    )
  }

  // 'no-store': la URL es personal y caduca; nunca debe quedar cacheada.
  return NextResponse.json({ url }, { headers: { 'Cache-Control': 'no-store' } })
}
