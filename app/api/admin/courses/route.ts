import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createSessionClient } from '@/lib/supabase/server'
import { createCourse } from '@/lib/services/admin'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // 1. Verify session
  const sessionClient = await createSessionClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  }

  // 2. Verify admin role
  const adminClient = createAdminClient()
  const { data: roleData } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  if (!roleData) {
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  }

  // 3. Parse and validate body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido.' }, { status: 400 })
  }

  const { title, slug, price_cents, currency, description, long_description, category, level, instructor_name, status } = body

  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'El título es obligatorio.' }, { status: 400 })
  }
  if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'El slug debe contener solo minúsculas, números y guiones.' }, { status: 400 })
  }
  if (typeof price_cents !== 'number' || price_cents < 0) {
    return NextResponse.json({ error: 'El precio debe ser un número mayor o igual a 0.' }, { status: 400 })
  }
  if (!description || typeof description !== 'string' || !description.trim()) {
    return NextResponse.json({ error: 'La descripción corta es obligatoria.' }, { status: 400 })
  }

  // 4. Create course
  const { data: course, error } = await createCourse({
    title: title.trim(),
    slug: slug.trim(),
    price_cents,
    currency: typeof currency === 'string' ? currency : 'eur',
    description: description.trim(),
    long_description: typeof long_description === 'string' ? long_description.trim() || null : null,
    category: typeof category === 'string' ? category.trim() || null : null,
    level: typeof level === 'string' ? level.trim() || null : null,
    instructor_name: typeof instructor_name === 'string' ? instructor_name.trim() || null : null,
    status: status === 'published' ? 'published' : 'draft',
  })

  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  return NextResponse.json({ course }, { status: 201 })
}
