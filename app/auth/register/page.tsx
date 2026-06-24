import Link from 'next/link'
import RegisterForm from '@/components/register-form'

export const metadata = {
  title: 'Crear cuenta — Academia Creativa',
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-h1 text-foreground">Crea tu cuenta</h1>
          <p className="text-muted-foreground mt-2">
            Empieza tu camino en el diseño.
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-small text-muted-foreground mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/auth/login"
            className="text-primary-strong hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
