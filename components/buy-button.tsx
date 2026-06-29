'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  courseId: string
  courseSlug: string
  isEnrolled: boolean
  userId: string | null
  className?: string
}

export function BuyButton({ courseId, courseSlug, isEnrolled, userId, className }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estado: ya matriculado — no ofrecer comprar lo que ya se tiene
  if (isEnrolled) {
    return (
      <button
        type="button"
        disabled
        className={`bg-accent text-white font-medium py-3 rounded-lg cursor-default opacity-90 ${className ?? ''}`}
      >
        Ya tienes este curso
      </button>
    )
  }

  async function handleBuy() {
    // Sin sesión: ir a login y volver al curso después
    if (!userId) {
      router.push(`/auth/login?next=/courses/${courseSlug}`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Ha ocurrido un error. Inténtalo de nuevo.')
        return
      }

      // Redirigir a la URL de pago de Stripe (abandona la SPA)
      window.location.href = data.url
    } catch {
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleBuy}
        disabled={loading}
        className={`bg-primary-button hover:bg-primary-strong hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-medium py-3 rounded-lg transition-all duration-200 ${className ?? ''}`}
      >
        {loading ? 'Procesando…' : 'Comprar'}
      </button>
      {error && (
        <p className="text-small text-red-600 text-center">{error}</p>
      )}
    </div>
  )
}
