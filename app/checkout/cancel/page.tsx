import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pago cancelado',
}

type Props = {
  searchParams: Promise<{ course?: string }>
}

export default async function CheckoutCancelPage({ searchParams }: Props) {
  const { course } = await searchParams

  const backHref = course ? `/courses/${course}` : '/'
  const backLabel = course ? 'Volver al curso' : 'Ver el catálogo'

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-10 text-center flex flex-col gap-6">

        {/* Icono neutral */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-terra-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-primary"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>

        {/* Mensaje principal */}
        <div className="flex flex-col gap-2">
          <h1 className="font-serif font-semibold text-h1 text-foreground">
            Pago cancelado
          </h1>
          <p className="text-body text-muted-foreground leading-relaxed">
            No se ha realizado ningún cargo. Puedes intentarlo de nuevo
            cuando quieras.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <Link
            href={backHref}
            className="w-full bg-primary-button hover:bg-primary-strong hover:shadow-md active:scale-95 text-white font-medium py-3 rounded-lg transition-all duration-200 text-center"
          >
            {backLabel}
          </Link>
          <Link
            href="/"
            className="w-full border border-border hover:bg-terra-50 text-foreground font-medium py-3 rounded-lg transition-colors text-center"
          >
            Ver el catálogo
          </Link>
        </div>

      </div>
    </main>
  )
}
