import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

// vi.hoisted ejecuta su callback ANTES que los factories de vi.mock,
// por eso podemos referenciar mockMaybeSingle dentro del factory de abajo.
const mockMaybeSingle = vi.hoisted(() => vi.fn())

// Mockeamos el cliente admin con una cadena fluida:
// supabase.from(...).select(...).eq(...).eq(...).maybeSingle()
// Cada método intermedio devuelve el mismo objeto (mockReturnThis),
// y solo maybeSingle() devuelve la Promise que configuramos por test.
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: mockMaybeSingle,
    })),
  })),
  createSessionClient: vi.fn(),
}))

import { getEnrollment } from '@/lib/services/courses'

describe('getEnrollment — comprobación de matrícula en un curso', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve true cuando el usuario está matriculado en el curso', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'enrollment-abc' }, error: null })

    const result = await getEnrollment('user-123', 'course-456')

    expect(result).toBe(true)
  })

  it('devuelve false cuando el usuario NO está matriculado', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })

    const result = await getEnrollment('user-123', 'course-456')

    expect(result).toBe(false)
  })

  it('devuelve false y registra el error en consola cuando Supabase falla', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Connection refused' },
    })

    const result = await getEnrollment('user-123', 'course-456')

    expect(result).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al comprobar matrícula:',
      'Connection refused'
    )
    consoleSpy.mockRestore()
  })
})
