import { redirect } from 'next/navigation'
import { createSessionClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Panel del alumno — Academia Creativa',
}

export default async function DashboardPage() {
  const supabase = await createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name ?? user.email ?? 'alumna'

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-lg text-center">
        <p className="text-caption font-medium text-primary-strong uppercase tracking-widest mb-4">
          Panel del alumno
        </p>
        <h1 className="font-serif text-h1 text-foreground mb-4">
          Bienvenida, {displayName}
        </h1>
        <p className="text-body text-muted-foreground">
          Esta sección está en construcción. Aquí encontrarás tus cursos, tu progreso y tus certificados.
        </p>
      </div>
    </div>
  )
}
