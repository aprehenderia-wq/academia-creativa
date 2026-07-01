'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

// Muestra un toast de éxito cuando la página de destino carga con
// ?<param>=true (usado para toasts que deben sobrevivir a una redirección,
// como registro o login exitosos). Limpia el parámetro de la URL después.
export function QueryToast({ param, message }: { param: string; message: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const shouldShow = searchParams.get(param) === 'true'

  useEffect(() => {
    if (!shouldShow) return

    toast.success(message)

    const params = new URLSearchParams(searchParams)
    params.delete(param)
    const query = params.toString()
    router.replace(query ? `?${query}` : window.location.pathname, { scroll: false })
  }, [shouldShow, message, param, router, searchParams])

  return null
}
