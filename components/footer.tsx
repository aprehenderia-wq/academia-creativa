import Link from 'next/link'
import { LogoMark } from '@/components/logo'
import { createSessionClient } from '@/lib/supabase/server'
import { DEFAULT_COVER_COLOR, CATEGORY_COLORS } from '@/lib/constants/category-colors'

const CATEGORY_GRADIENT = `linear-gradient(to right, ${DEFAULT_COVER_COLOR}, ${CATEGORY_COLORS['Ilustración']}, ${CATEGORY_COLORS['Branding']}, ${CATEGORY_COLORS['Motion Graphics']})`

export default async function Footer() {
  const supabase = await createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <footer className="w-full bg-terra-50">
      {/* Tres columnas */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">

          {/* Columna 1 — Marca */}
          <div className="flex flex-col gap-4">
            <LogoMark size={32} />
            <p className="text-small text-muted-foreground leading-relaxed max-w-xs">
              Cursos de diseño digital para creativos que quieren vivir de lo que aman.
            </p>
          </div>

          {/* Columna 2 — Plataforma */}
          <div className="flex flex-col gap-4">
            <p className="text-caption font-semibold text-foreground uppercase tracking-widest">
              Plataforma
            </p>
            <nav className="flex flex-col gap-3" aria-label="Navegación del pie de página">
              <Link
                href="/#catalogo"
                className="text-small text-muted-foreground hover:text-foreground transition-colors"
              >
                Catálogo de cursos
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className="text-small text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mis cursos
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-small text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-small text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Crear cuenta
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Columna 3 — Contacto */}
          <div className="flex flex-col gap-4">
            <p className="text-caption font-semibold text-foreground uppercase tracking-widest">
              Contacto
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-small text-muted-foreground">
                ¿Preguntas? Escríbenos
              </p>
              <a
                href="mailto:hola@academiacreativa.com"
                className="text-small text-primary-button hover:text-primary-strong transition-colors"
              >
                hola@academiacreativa.com
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Fila inferior */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div
          className="h-[2px] w-full mb-5"
          style={{ background: CATEGORY_GRADIENT }}
        />
        <p className="text-caption text-muted-foreground">
          © 2026 Academia Creativa
        </p>
      </div>
    </footer>
  )
}
