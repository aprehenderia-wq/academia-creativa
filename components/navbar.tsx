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
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    displayName = profile?.full_name ?? user.email ?? null
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="hover:opacity-80 transition-opacity" aria-label="Academia Creativa — inicio">
          <LogoMark size={34} />
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-small text-muted-foreground hidden sm:block truncate max-w-[160px]">
                {displayName}
              </span>
              <Link
                href="/dashboard"
                className="text-small font-medium text-foreground hover:text-primary-strong transition-colors"
              >
                Mis cursos
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-small font-medium text-foreground hover:text-primary-strong transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
