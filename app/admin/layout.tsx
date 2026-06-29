import { redirect } from 'next/navigation'
import { createAdminClient, createSessionClient } from '@/lib/supabase/server'
import { AdminNav } from '@/components/admin-nav'

export const metadata = { title: 'Admin — Academia Creativa' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessionClient = await createSessionClient()
  const { data: { user } } = await sessionClient.auth.getUser()

  if (!user) redirect('/auth/login')

  const adminClient = createAdminClient()
  const { data: roleData } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  if (!roleData) redirect('/')

  return (
    <div className="flex flex-col md:flex-row flex-1">
      <AdminNav />
      <main className="flex-1 p-6 md:p-8 min-w-0">
        {children}
      </main>
    </div>
  )
}
