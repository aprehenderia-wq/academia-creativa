import Link from 'next/link'
import { createSessionClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/logout-button'
import { LogoMark } from '@/components/logo'

export default async function Navbar() {
  const supabase = await createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let displayName: string | null = null
  let isAdmin = false
  if (user) {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle(),
    ])
    displayName = profileRes.data?.full_name ?? user.email ?? null
    isAdmin = !!roleRes.data
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo — grupo visual anclado a la izquierda */}
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity shrink-0"
          aria-label="Academia Creativa — inicio"
        >
          <LogoMark size={34} />
        </Link>

        {/* Navegación derecha */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              {/* Nombre: contexto, no acción — separado del resto con borde */}
              {displayName && (
                <span className="hidden sm:block text-small text-muted-foreground truncate max-w-[140px] pr-3 mr-2 border-r border-border">
                  {displayName}
                </span>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:block text-small font-medium text-muted-foreground hover:text-foreground hover:bg-terra-50 px-3 py-2 rounded-md transition-colors"
                >
                  Admin
                </Link>
              )}

              <Link
                href="/dashboard"
                className="text-small font-medium text-foreground hover:text-primary-strong hover:bg-terra-50 px-3 py-2 rounded-md transition-colors"
              >
                Mis cursos
              </Link>

              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-small font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                className="text-small font-medium text-white bg-primary-button hover:bg-primary-strong px-4 py-2.5 rounded-lg transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  )
}
