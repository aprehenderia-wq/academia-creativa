import type { Metadata } from 'next'
import { getAdminStats } from '@/lib/services/admin'

export const metadata: Metadata = {
  title: 'Panel de administración',
}

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  return (
    <div>
      <h1 className="font-serif font-semibold text-h1 text-foreground mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Cursos publicados" value={stats.publishedCourses} color="#D85A30" />
        <StatCard label="Alumnos registrados" value={stats.totalStudents} color="#0F6E56" />
        <StatCard label="Matrículas activas" value={stats.activeEnrollments} color="#9A5F0F" />
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-2">
      <p className="text-small text-muted-foreground">{label}</p>
      <p className="font-serif font-semibold text-display leading-none" style={{ color: color ?? '#2C2C2A' }}>
        {value}
      </p>
    </div>
  )
}
