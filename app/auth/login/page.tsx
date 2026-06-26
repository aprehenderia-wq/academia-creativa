import Link from 'next/link'
import LoginForm from '@/components/login-form'

export const metadata = {
  title: 'Iniciar sesión — Academia Creativa',
}

type Props = {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-h1 text-foreground">Bienvenida de vuelta</h1>
          <p className="text-muted-foreground mt-2">
            Entra en tu cuenta para continuar.
          </p>
        </div>

        <LoginForm redirectTo={next} />

        <p className="text-center text-small text-muted-foreground mt-6">
          ¿No tienes cuenta?{' '}
          <Link
            href="/auth/register"
            className="text-primary-strong hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
