import { describe, it, expect, vi } from 'vitest'

// server-only lanza un error fuera de Next.js — lo neutralizamos para tests
vi.mock('server-only', () => ({}))

// El constructor de Resend exige una API key real; lo reemplazamos por una clase vacía
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: vi.fn() }
  },
}))

import {
  buildWelcomeEmailHtml,
  buildPurchaseEmailHtml,
  buildInactivityReminderHtml,
} from '@/lib/services/email'

// ─── buildWelcomeEmailHtml ────────────────────────────────────────────────────

describe('buildWelcomeEmailHtml', () => {
  const html = buildWelcomeEmailHtml({ studentName: 'Ana García' })

  it('incluye el nombre del alumno en el saludo', () => {
    expect(html).toContain('Ana García')
  })

  it('incluye el enlace al catálogo de cursos', () => {
    // Sin variable de entorno, usa la URL de producción por defecto
    expect(html).toContain('https://academia-creativa-one.vercel.app')
  })

  it('es un documento HTML válido (tiene etiquetas básicas)', () => {
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('</html>')
  })
})

// ─── buildPurchaseEmailHtml ───────────────────────────────────────────────────

describe('buildPurchaseEmailHtml', () => {
  const html = buildPurchaseEmailHtml({
    studentName: 'Ana García',
    courseName: 'Diseño de Logos',
    courseUrl: 'https://academia-creativa-one.vercel.app/dashboard/cursos/diseno-logos',
  })

  it('incluye el nombre del alumno', () => {
    expect(html).toContain('Ana García')
  })

  it('incluye el nombre del curso comprado', () => {
    expect(html).toContain('Diseño de Logos')
  })

  it('incluye el enlace directo al curso', () => {
    expect(html).toContain(
      'https://academia-creativa-one.vercel.app/dashboard/cursos/diseno-logos'
    )
  })

  it('es un documento HTML válido (tiene etiquetas básicas)', () => {
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('</html>')
  })
})

// ─── buildInactivityReminderHtml ─────────────────────────────────────────────

describe('buildInactivityReminderHtml', () => {
  const html = buildInactivityReminderHtml({
    studentName: 'Ana García',
    courseName: 'Branding desde Cero',
    courseUrl: 'https://academia-creativa-one.vercel.app/dashboard/cursos/branding',
  })

  it('incluye el nombre del alumno en el mensaje motivacional', () => {
    expect(html).toContain('Ana García')
  })

  it('incluye el nombre del curso en el que hay inactividad', () => {
    expect(html).toContain('Branding desde Cero')
  })

  it('incluye el enlace para retomar el curso', () => {
    expect(html).toContain(
      'https://academia-creativa-one.vercel.app/dashboard/cursos/branding'
    )
  })

  it('es un documento HTML válido (tiene etiquetas básicas)', () => {
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('</html>')
  })
})
