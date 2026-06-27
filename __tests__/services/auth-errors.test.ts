import { describe, it, expect } from 'vitest'
import { translateAuthError } from '@/lib/services/auth'

describe('translateAuthError — traducción de errores de Supabase al español', () => {
  it('traduce "User already registered" → ya existe una cuenta con ese email', () => {
    expect(translateAuthError('User already registered')).toBe(
      'Ya existe una cuenta con este email.'
    )
  })

  it('traduce "Password should be at least" → contraseña demasiado corta', () => {
    expect(translateAuthError('Password should be at least 6 characters')).toBe(
      'La contraseña debe tener al menos 6 caracteres.'
    )
  })

  it('traduce "Invalid login credentials" → email o contraseña incorrectos', () => {
    expect(translateAuthError('Invalid login credentials')).toBe(
      'El email o la contraseña no son correctos.'
    )
  })

  it('traduce "Email not confirmed" → pide confirmar el correo antes de entrar', () => {
    expect(translateAuthError('Email not confirmed')).toBe(
      'Confirma tu correo electrónico antes de iniciar sesión.'
    )
  })

  it('devuelve mensaje genérico para cualquier error desconocido de Supabase', () => {
    expect(translateAuthError('unexpected_error_code: something went wrong')).toBe(
      'Ha ocurrido un error. Inténtalo de nuevo.'
    )
  })
})
