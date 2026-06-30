import ResetPasswordForm from '@/components/reset-password-form'

export const metadata = {
  title: 'Nueva contraseña',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-h1 text-foreground">Nueva contraseña</h1>
          <p className="text-muted-foreground mt-2">
            Elige una contraseña segura para tu cuenta.
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  )
}
