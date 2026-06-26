import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pago completado — Academia Creativa',
}

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-10 text-center flex flex-col gap-6">

        {/* Icono de confirmación */}
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
              className="w-8 h-8 text-accent"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        </div>

        {/* Mensaje principal */}
        <div className="flex flex-col gap-2">
          <h1 className="font-serif font-semibold text-h1 text-foreground">
            ¡Pago completado!
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Tu compra se ha procesado correctamente. En breve tendrás
            acceso al curso en tu panel.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full bg-primary-button hover:bg-primary-strong text-white font-medium py-3 rounded-lg transition-colors text-center"
          >
            Ir a mi panel
          </Link>
          <Link
            href="/"
            className="w-full border border-border hover:bg-terra-50 text-foreground font-medium py-3 rounded-lg transition-colors text-center"
          >
            Ver más cursos
          </Link>
        </div>

      </div>
    </main>
  )
}
