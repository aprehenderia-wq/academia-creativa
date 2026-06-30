'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updatePassword } from '@/lib/services/auth'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [exchanging, setExchanging] = useState(true)
  const [exchangeError, setExchangeError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Intercambia el código PKCE del email por una sesión activa.
  // Sin este paso, updateUser falla porque no hay sesión.
  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setExchanging(false)
      return
    }
    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setExchangeError('Tu enlace de recuperación ha expirado. Solicita uno nuevo.')
      }
      setExchanging(false)
    })
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    const { error: authError } = await updatePassword(password)

    if (authError) {
      setError(authError)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  if (exchanging) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (exchangeError) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p role="alert" className="text-small text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {exchangeError}
        </p>
        <Link href="/auth/forgot-password" className="text-small text-accent hover:underline">
          Solicitar un nuevo enlace
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-small font-medium text-foreground">
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          disabled={loading}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          className="h-11 px-3 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm" className="text-small font-medium text-foreground">
          Confirmar contraseña
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={6}
          disabled={loading}
          autoComplete="new-password"
          placeholder="Repite la contraseña"
          className="h-11 px-3 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        />
      </div>

      {error && (
        <p role="alert" className="text-small text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-11 bg-primary-button text-white font-medium rounded-md hover:bg-primary-strong hover:shadow-md active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
      </button>
    </form>
  )
}
