import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Página no encontrada',
}

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 text-center">
      <p className="font-sans text-caption font-medium uppercase tracking-widest text-primary-strong mb-4">
        Error 404
      </p>
      <h1 className="font-serif text-display font-semibold text-foreground mb-4">
        Página no encontrada
      </h1>
      <p className="text-small text-muted-foreground max-w-sm mb-8">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="bg-primary-button hover:bg-primary-strong hover:shadow-md active:scale-95 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
