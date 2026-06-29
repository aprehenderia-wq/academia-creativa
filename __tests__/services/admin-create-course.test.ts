import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const mockSingle = vi.hoisted(() => vi.fn())
const mockMaybeSingle = vi.hoisted(() => vi.fn())
const mockInsert = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'courses') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: mockMaybeSingle,
          insert: mockInsert,
        }
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: mockMaybeSingle }
    }),
  })),
}))

import { createCourse } from '@/lib/services/admin'

const validInput = {
  title: 'Branding desde cero',
  slug: 'branding-desde-cero',
  price_cents: 2900,
  currency: 'eur',
  description: 'Aprende branding de forma práctica.',
  status: 'draft' as const,
}

describe('createCourse', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns created course on success', async () => {
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: mockSingle,
      }),
    })
    mockSingle.mockResolvedValueOnce({
      data: { id: 'c1', ...validInput, category: null, level: null, instructor_name: null, long_description: null, enrollment_count: 0 },
      error: null,
    })

    const result = await createCourse(validInput)
    expect(result.error).toBeNull()
    expect(result.data?.title).toBe('Branding desde cero')
    expect(result.data?.enrollment_count).toBe(0)
    expect(result.data?.id).toBe('c1')
  })

  it('returns error when slug already exists', async () => {
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: mockSingle,
      }),
    })
    mockSingle.mockResolvedValueOnce({ data: null, error: { code: '23505', message: 'duplicate key value' } })

    const result = await createCourse(validInput)
    expect(result.error).toBe('El slug ya está en uso. Elige otro.')
    expect(result.data).toBeNull()
  })

  it('returns error when Supabase insert fails', async () => {
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: mockSingle,
      }),
    })
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

    const result = await createCourse(validInput)
    expect(result.error).toBe('DB error')
    expect(result.data).toBeNull()
  })
})
