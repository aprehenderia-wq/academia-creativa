import { NextRequest, NextResponse } from 'next/server'
import { createSessionClient, createAdminClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  // 1. Verificar que hay sesión activa
  const supabase = await createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Debes iniciar sesión para comprar un curso.' },
      { status: 401 }
    )
  }

  // 2. Leer courseId del body
  let courseId: string | undefined
  try {
    const body = await request.json()
    courseId = body.courseId
  } catch {
    return NextResponse.json({ error: 'Petición mal formada.' }, { status: 400 })
  }

  if (!courseId) {
    return NextResponse.json({ error: 'Falta el id del curso.' }, { status: 400 })
  }

  // 3. Buscar el curso y su precio de Stripe
  const admin = createAdminClient()
  const { data: course, error: courseError } = await admin
    .from('courses')
    .select('id, title, slug, stripe_price_id')
    .eq('id', courseId)
    .eq('status', 'published')
    .single()

  if (courseError || !course) {
    return NextResponse.json({ error: 'Curso no encontrado.' }, { status: 404 })
  }

  if (!course.stripe_price_id) {
    return NextResponse.json(
      { error: 'Este curso no tiene precio configurado. Contacta con soporte.' },
      { status: 400 }
    )
  }

  // 4. Comprobar que el usuario no esté ya matriculado
  const { data: existingEnrollment } = await admin
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (existingEnrollment) {
    return NextResponse.json(
      { error: 'Ya estás matriculado en este curso.' },
      { status: 409 }
    )
  }

  // 5. Crear la Checkout Session en Stripe
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://academia-creativa-one.vercel.app'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price: course.stripe_price_id,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/cancel?course=${course.slug}`,
    // metadata se usará en el webhook (Fase 4, rebanada 3) para matricular
    // al usuario sin necesidad de parámetros en la URL de éxito.
    metadata: {
      course_id: course.id,
      user_id: user.id,
      course_title: course.title,
      course_slug: course.slug,
    },
  })

  return NextResponse.json({ url: session.url })
}
