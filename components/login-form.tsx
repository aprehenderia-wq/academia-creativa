'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { signIn } from '@/lib/services/auth'

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const { error: authError } = await signIn(email, password)
    if (authError) {
      setError(authError)
      toast.error('Algo salió mal. Inténtalo de nuevo.')
      setLoading(false)
      return
    }

    toast.success('Sesión iniciada')
    router.push(redirectTo ?? '/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          className="h-11 px-3 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
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
          disabled={loading}
          autoComplete="current-password"
          placeholder="Tu contraseña"
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
        {loading ? 'Entrando...' : 'Iniciar sesión'}
      </button>

      <p className="text-center text-small text-muted-foreground">
        <Link href="/auth/forgot-password" className="text-accent hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </form>
  )
}
