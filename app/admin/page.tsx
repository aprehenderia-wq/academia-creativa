import { getAdminStats } from '@/lib/services/admin'

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  return (
    <div>
      <h1 className="font-serif font-semibold text-h1 text-foreground mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Cursos publicados" value={stats.publishedCourses} />
        <StatCard label="Alumnos registrados" value={stats.totalStudents} />
        <StatCard label="Matrículas activas" value={stats.activeEnrollments} />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-2">
      <p className="text-small text-muted-foreground">{label}</p>
      <p className="font-serif font-semibold text-display text-foreground leading-none">
        {value}
      </p>
    </div>
  )
}
