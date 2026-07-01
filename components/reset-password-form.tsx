'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updatePassword } from '@/lib/services/auth'

// La sesión ya está activa cuando el usuario llega aquí:
// /auth/callback intercambió el código PKCE en el servidor antes de redirigir.
export default function ResetPasswordForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      toast.error('Algo salió mal. Inténtalo de nuevo.')
      setLoading(false)
      return
    }

    toast.success('Contraseña actualizada. Ya puedes iniciar sesión.')
    router.push('/dashboard')
    router.refresh()
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
