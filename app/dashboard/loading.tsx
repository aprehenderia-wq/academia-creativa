// Skeleton del dashboard: certificados + tarjetas de cursos matriculados
function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-border ${className ?? ''}`} />
}

function EnrolledCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card">
      <Bone className="h-36 w-full rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        <Bone className="h-5 w-3/4" />
        <Bone className="h-4 w-full" />
        <Bone className="h-2 w-full rounded-full" />
        <Bone className="h-4 w-20" />
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">

        {/* Encabezado */}
        <div className="mb-10 flex flex-col gap-3">
          <Bone className="h-4 w-32" />
          <Bone className="h-9 w-56" />
        </div>

        {/* Certificados */}
        <div className="mb-12">
          <Bone className="h-8 w-40 mb-6" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
            <div className="flex-1 flex flex-col gap-2">
              <Bone className="h-5 w-48" />
              <Bone className="h-4 w-36" />
            </div>
            <Bone className="h-10 w-36 rounded-lg shrink-0" />
          </div>
        </div>

        {/* Cursos */}
        <Bone className="h-4 w-32 mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <EnrolledCardSkeleton key={i} />)}
        </div>

      </div>
    </div>
  )
}
