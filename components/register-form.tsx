'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { signUp } from '@/lib/services/auth'
import { createProfileAction, sendWelcomeEmailAction } from '@/app/auth/actions'

export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      const { error: authError } = await signUp(email, password, fullName)
      if (authError) {
        setError(authError)
        setLoading(false)
        return
      }
      await Promise.all([
        createProfileAction(fullName),
        sendWelcomeEmailAction(email, fullName),
      ])
      router.push('/')
      router.refresh()
    } catch {
      setError('Ha ocurrido un error inesperado. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-small font-medium text-foreground">
          Nombre
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          disabled={loading}
          autoComplete="name"
          placeholder="Tu nombre completo"
          className="h-11 px-3 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-small font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={loading}
          autoComplete="email"
          placeholder="tu@email.com"
          className="h-11 px-3 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-small font-medium text-foreground">
          Contraseña
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
          className="h-11 px-3 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
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
        className="h-11 bg-primary-button text-white font-medium rounded-md hover:bg-primary-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}
