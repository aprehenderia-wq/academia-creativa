'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CATEGORIES, LEVELS } from '@/lib/constants/courses'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function AdminCourseForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugEdited, setSlugEdited] = useState(false)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    price: '',
    description: '',
    long_description: '',
    category: '',
    level: '',
    instructor_name: '',
    status: 'draft' as 'draft' | 'published',
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleTitleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugEdited ? prev.slug : slugify(value),
    }))
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true)
    setForm((prev) => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!form.title.trim()) errors.title = 'El título es obligatorio.'
    if (!form.slug.trim()) errors.slug = 'El slug es obligatorio.'
    else if (!/^[a-z0-9-]+$/.test(form.slug)) errors.slug = 'Solo minúsculas, números y guiones.'
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0)
      errors.price = 'Introduce un precio válido (mínimo 0).'
    if (!form.description.trim()) errors.description = 'La descripción corta es obligatoria.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim(),
          price_cents: Math.round(Number(form.price) * 100),
          currency: 'eur',
          description: form.description.trim(),
          long_description: form.long_description.trim() || null,
          category: form.category || null,
          level: form.level || null,
          instructor_name: form.instructor_name.trim() || null,
          status: form.status,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Ha ocurrido un error.')
        toast.error('Algo salió mal. Inténtalo de nuevo.')
        return
      }
      toast.success('Curso creado con éxito')
      router.push('/admin/cursos')
    } catch {
      setError('No se pudo conectar con el servidor.')
      toast.error('Algo salió mal. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
      {error && (
        <p role="alert" className="text-small text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
          {error}
        </p>
      )}

      {/* Título + Slug */}
      <section className="flex flex-col gap-5">
        <h2 className="font-serif text-h3 text-foreground">Información básica</h2>

        <Field label="Título" required error={fieldErrors.title}>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            disabled={loading}
            placeholder="Branding desde cero"
            className={inputCls(!!fieldErrors.title)}
          />
        </Field>

        <Field label="Slug (URL)" required error={fieldErrors.slug} hint="Solo minúsculas, números y guiones.">
          <input
            type="text"
            value={form.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            disabled={loading}
            placeholder="branding-desde-cero"
            className={inputCls(!!fieldErrors.slug)}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Precio (€)" required error={fieldErrors.price}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              disabled={loading}
              placeholder="29.00"
              className={inputCls(!!fieldErrors.price)}
            />
          </Field>

          <Field label="Estado">
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as 'draft' | 'published' }))}
              disabled={loading}
              className={inputCls(false)}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Descripciones */}
      <section className="flex flex-col gap-5">
        <h2 className="font-serif text-h3 text-foreground">Descripción</h2>

        <Field label="Descripción corta" required error={fieldErrors.description} hint="Aparece en la tarjeta del catálogo.">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            disabled={loading}
            placeholder="Aprende a construir una identidad de marca sólida desde los fundamentos."
            className={`${inputCls(!!fieldErrors.description, true)} resize-none`}
          />
        </Field>

        <Field label="Descripción larga" hint="Opcional. Aparece en la página de detalle del curso.">
          <textarea
            rows={5}
            value={form.long_description}
            onChange={(e) => setForm((p) => ({ ...p, long_description: e.target.value }))}
            disabled={loading}
            placeholder="En este curso explorarás..."
            className={`${inputCls(false, true)} resize-none`}
          />
        </Field>
      </section>

      {/* Metadata */}
      <section className="flex flex-col gap-5">
        <h2 className="font-serif text-h3 text-foreground">Clasificación</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Categoría">
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              disabled={loading}
              className={inputCls(false)}
            >
              <option value="">Sin categoría</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Nivel">
            <select
              value={form.level}
              onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
              disabled={loading}
              className={inputCls(false)}
            >
              <option value="">Sin nivel</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Instructor">
          <input
            type="text"
            value={form.instructor_name}
            onChange={(e) => setForm((p) => ({ ...p, instructor_name: e.target.value }))}
            disabled={loading}
            placeholder="Nombre del instructor"
            className={inputCls(false)}
          />
        </Field>
      </section>

      {/* Acciones */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-button hover:bg-primary-strong hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200"
        >
          {loading ? 'Creando curso…' : 'Crear curso'}
        </button>
        <a
          href="/admin/cursos"
          className="text-small text-muted-foreground hover:text-foreground transition-colors inline-flex items-center py-3"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean, isTextarea = false) {
  return `w-full ${isTextarea ? 'py-2' : 'h-11'} px-3 rounded-md border bg-card text-foreground text-small placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition-colors ${
    hasError ? 'border-red-400 focus:ring-red-300' : 'border-border'
  }`
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-small font-medium text-foreground">
        {label}
        {required && <span className="text-primary-strong ml-1" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-caption text-muted-foreground">{hint}</p>}
      {error && <p role="alert" className="text-caption text-red-600">{error}</p>}
    </div>
  )
}
