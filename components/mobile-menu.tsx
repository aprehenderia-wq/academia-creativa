'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import LogoutButton from '@/components/logout-button'

type Props = {
  displayName: string | null
  isAdmin: boolean
  isLoggedIn: boolean
}

export function MobileMenu({ displayName, isAdmin, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const close = () => setOpen(false)

  return (
    <div className="md:hidden" ref={containerRef}>
      {/* Botón hamburguesa */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        className="flex items-center justify-center w-11 h-11 rounded-md text-foreground hover:bg-terra-50 transition-colors"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="17" y2="6" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="14" x2="17" y2="14" />
          </svg>
        )}
      </button>

      {/* Menú desplegable */}
      <div
        role="menu"
        className={`absolute top-16 left-0 right-0 bg-card border-b border-border shadow-md z-50 transition-all duration-200 ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col px-4 py-2">
          {displayName && (
            <span className="text-small text-muted-foreground px-2 py-3 border-b border-border mb-1 truncate">
              {displayName}
            </span>
          )}

          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={close}
                  role="menuitem"
                  className="text-small font-medium text-muted-foreground hover:text-foreground hover:bg-terra-50 px-2 py-3 rounded-md transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                onClick={close}
                role="menuitem"
                className="text-small font-medium text-foreground hover:text-primary-strong hover:bg-terra-50 px-2 py-3 rounded-md transition-colors"
              >
                Mis cursos
              </Link>
              <div className="pt-1 pb-1">
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={close}
                role="menuitem"
                className="text-small font-medium text-muted-foreground hover:text-foreground px-2 py-3 rounded-md transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                onClick={close}
                role="menuitem"
                className="text-small font-medium text-white bg-primary-button hover:bg-primary-strong px-4 py-3 rounded-lg transition-colors my-2 text-center"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}
