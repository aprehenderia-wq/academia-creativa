import { describe, it, expect, vi } from 'vitest'

// server-only lanza un error fuera de Next.js — lo neutralizamos para tests
vi.mock('server-only', () => ({}))

import { buildSignedEmbedUrl, SIGNED_URL_TTL_SECONDS } from '@/lib/bunny'

// ─── buildSignedEmbedUrl ──────────────────────────────────────────────────────

describe('buildSignedEmbedUrl', () => {
  const params = {
    libraryId: '12345',
    videoId: 'abc-123',
    tokenAuthKey: 'test-key',
    expires: 1700000000,
  }

  it('genera el token SHA-256 esperado (orden tokenKey + videoId + expires)', () => {
    // Hash conocido de: sha256('test-key' + 'abc-123' + '1700000000')
    const expectedToken =
      '754a652e752913c07cba244d5a2265195773a17ba0c994ad81dbbf1b54e9817c'
    const url = buildSignedEmbedUrl(params)
    expect(url).toContain(`token=${expectedToken}`)
  })

  it('apunta al iframe embed de Bunny con library y video correctos', () => {
    const url = buildSignedEmbedUrl(params)
    expect(url).toContain(
      'https://iframe.mediadelivery.net/embed/12345/abc-123?'
    )
  })

  it('incluye expires como parámetro de consulta', () => {
    const url = buildSignedEmbedUrl(params)
    expect(url).toContain('expires=1700000000')
  })

  it('el token es un hash hexadecimal de 64 caracteres', () => {
    const url = buildSignedEmbedUrl(params)
    const token = new URL(url).searchParams.get('token')
    expect(token).toMatch(/^[a-f0-9]{64}$/)
  })

  it('cambia el token si cambia el video (no es reutilizable entre vídeos)', () => {
    const a = buildSignedEmbedUrl(params)
    const b = buildSignedEmbedUrl({ ...params, videoId: 'otro-video' })
    const tokenA = new URL(a).searchParams.get('token')
    const tokenB = new URL(b).searchParams.get('token')
    expect(tokenA).not.toBe(tokenB)
  })

  it('cambia el token si cambia la fecha de expiración', () => {
    const a = buildSignedEmbedUrl(params)
    const b = buildSignedEmbedUrl({ ...params, expires: params.expires + 1 })
    const tokenA = new URL(a).searchParams.get('token')
    const tokenB = new URL(b).searchParams.get('token')
    expect(tokenA).not.toBe(tokenB)
  })
})

// ─── SIGNED_URL_TTL_SECONDS ───────────────────────────────────────────────────

describe('SIGNED_URL_TTL_SECONDS', () => {
  it('equivale a 4 horas en segundos', () => {
    expect(SIGNED_URL_TTL_SECONDS).toBe(4 * 60 * 60)
    expect(SIGNED_URL_TTL_SECONDS).toBe(14400)
  })
})
