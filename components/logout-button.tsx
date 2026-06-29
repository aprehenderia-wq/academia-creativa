'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/services/auth'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-small font-medium text-muted-foreground hover:text-foreground hover:bg-terra-50 px-3 py-3 rounded-md transition-colors disabled:opacity-50"
    >
      {loading ? 'Saliendo...' : 'Cerrar sesión'}
    </button>
  )
}
