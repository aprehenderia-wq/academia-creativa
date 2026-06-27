import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

// El runtime DEBE ser Node.js (no Edge). La verificación de firma de Stripe
// usa APIs de criptografía que no existen en el runtime Edge; si Next.js
// ejecutara esto en Edge, la verificación fallaría siempre.
export const runtime = 'nodejs'

// Stripe avisa de un pago completado mediante una petición POST a esta ruta.
// A esto se le llama "webhook": Stripe es quien nos llama a nosotros, no al
// revés. Aquí cerramos el circuito: confirmamos el pago y matriculamos.
export async function POST(request: NextRequest) {
  // 1. Leer el cuerpo CRUDO, tal cual llegó (sin convertirlo a JSON todavía).
  //    Stripe firma los bytes exactos que envió; si parseáramos el JSON, esos
  //    bytes cambiarían y la firma ya no coincidiría. Por eso usamos .text().
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Falta la cabecera de firma de Stripe.' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    // Esto es un fallo de configuración nuestro, no de Stripe.
    console.error('[webhook stripe] Falta STRIPE_WEBHOOK_SECRET en el entorno.')
    return NextResponse.json(
      { error: 'Webhook mal configurado en el servidor.' },
      { status: 500 }
    )
  }

  // 2. Verificar la firma. Esto confirma dos cosas a la vez: que la petición
  //    viene de verdad de Stripe (y no de un atacante) y que el cuerpo no fue
  //    manipulado por el camino. Si algo no cuadra, lanza una excepción.
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error(
      '[webhook stripe] Firma inválida:',
      err instanceof Error ? err.message : err
    )
    return NextResponse.json({ error: 'Firma inválida.' }, { status: 400 })
  }

  // 3. Solo nos interesa el evento de pago completado. Stripe envía muchos
  //    tipos de evento; cualquier otro lo confirmamos con 200 (para que Stripe
  //    no lo reintente) pero no hacemos nada con él.
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // 4. Recuperar el course_id y el user_id que la Checkout Session adjuntó en
  //    su metadata. Son los mismos que pusimos en app/api/checkout/route.ts.
  const courseId = session.metadata?.course_id
  const userId = session.metadata?.user_id

  if (!courseId || !userId) {
    // Si falta el metadata no podemos matricular a nadie. Respondemos 400:
    // es un dato que falta de origen, reintentar no lo arreglaría.
    console.error(
      '[webhook stripe] Metadata incompleta en la sesión',
      session.id,
      session.metadata
    )
    return NextResponse.json(
      { error: 'Metadata incompleta: falta course_id o user_id.' },
      { status: 400 }
    )
  }

  // 5. Matricular usando el cliente service_role. Esta clave salta la RLS, que
  //    a propósito prohíbe insertar en enrollments desde el navegador. Solo el
  //    servidor, tras confirmar el pago, puede crear la matrícula.
  const admin = createAdminClient()

  // 6. Idempotencia: Stripe puede reenviar el mismo evento más de una vez. Si
  //    el alumno ya está matriculado, no creamos otra fila.
  const { data: existing, error: existingError } = await admin
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()

  if (existingError) {
    console.error(
      '[webhook stripe] Error consultando matrícula existente:',
      existingError.message
    )
    // Error de base de datos: respondemos 500 para que Stripe reintente.
    return NextResponse.json({ error: 'Error de base de datos.' }, { status: 500 })
  }

  if (existing) {
    // Ya estaba matriculado: confirmamos a Stripe y salimos sin duplicar.
    return NextResponse.json({ received: true, alreadyEnrolled: true })
  }

  const { error: insertError } = await admin
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId })

  if (insertError) {
    // Red de seguridad para una "carrera": si dos copias del mismo evento
    // llegan casi a la vez, la comprobación anterior puede no verse y ambas
    // intentan insertar. La segunda choca con el unique (user_id, course_id),
    // que en Postgres da el código 23505. Eso NO es un fallo real: el alumno
    // quedó matriculado igual, así que lo tratamos como éxito.
    if (insertError.code === '23505') {
      return NextResponse.json({ received: true, alreadyEnrolled: true })
    }
    console.error(
      '[webhook stripe] Error creando la matrícula:',
      insertError.message
    )
    return NextResponse.json({ error: 'Error de base de datos.' }, { status: 500 })
  }

  console.log(
    `[webhook stripe] Matrícula creada: usuario ${userId} → curso ${courseId}`
  )

  // 7. Confirmar a Stripe que todo salió bien. Si no respondiéramos 200,
  //    Stripe daría el evento por fallido y lo reintentaría.
  return NextResponse.json({ received: true })
}
