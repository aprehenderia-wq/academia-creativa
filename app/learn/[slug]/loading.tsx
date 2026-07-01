// Skeleton del aula: video player + sidebar de lecciones
function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-border ${className ?? ''}`} />
}

export default function LearnLoading() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* Encabezado */}
        <div className="mb-8 flex flex-col gap-3">
          <Bone className="h-4 w-28" />
          <Bone className="h-8 w-72" />
        </div>

        {/* Contenido: video + sidebar */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-6">

          {/* Video player */}
          <div className="flex flex-col gap-4">
            <Bone className="w-full aspect-video rounded-xl" />
            <Bone className="h-6 w-56" />
          </div>

          {/* Sidebar lecciones */}
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <div className="bg-terra-50 px-4 py-3 border-b border-border">
              <Bone className="h-5 w-24" />
            </div>
            <div className="flex flex-col divide-y divide-border">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <Bone className="h-5 w-5 rounded-full shrink-0" />
                  <Bone className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
