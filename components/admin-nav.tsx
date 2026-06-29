'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/alumnos', label: 'Alumnos' },
  { href: '/admin/cursos', label: 'Cursos' },
  { href: '/admin/transacciones', label: 'Transacciones' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop: sidebar vertical */}
      <aside className="hidden md:flex flex-col w-52 shrink-0 border-r border-border bg-card min-h-full">
        <div className="p-4 border-b border-border">
          <p className="text-caption font-medium text-muted-foreground uppercase tracking-widest px-3">
            Panel admin
          </p>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-small font-medium px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-success-bg text-accent'
                    : 'text-foreground hover:bg-success-bg hover:text-accent'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            href="/"
            className="text-small text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Mobile: barra horizontal */}
      <div className="md:hidden border-b border-border bg-card">
        <div className="flex items-center overflow-x-auto px-2 py-2 gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-small font-medium px-3 py-3 rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-success-bg text-accent'
                    : 'text-foreground hover:bg-success-bg hover:text-accent'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <Link
            href="/"
            className="text-small text-muted-foreground px-3 py-3 whitespace-nowrap ml-auto"
          >
            ← Sitio
          </Link>
        </div>
      </div>
    </>
  )
}
