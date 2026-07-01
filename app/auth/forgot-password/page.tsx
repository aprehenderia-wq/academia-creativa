import Link from 'next/link'
import ForgotPasswordForm from '@/components/forgot-password-form'

export const metadata = {
  title: 'Recuperar contraseña',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-h1 text-foreground">Recuperar contraseña</h1>
          <p className="text-muted-foreground mt-2">
            Escribe tu email y te enviaremos un enlace para crear una nueva contraseña.
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="text-center text-small text-muted-foreground mt-6">
          <Link href="/auth/login" className="text-accent hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
