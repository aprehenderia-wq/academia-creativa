// Skeleton del home: hero + catálogo de cursos
function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-border ${className ?? ''}`} />
}

function CourseCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card">
      <Bone className="h-48 w-full rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex gap-2">
          <Bone className="h-5 w-20" />
          <Bone className="h-5 w-16" />
        </div>
        <Bone className="h-6 w-3/4" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-5/6" />
        <div className="flex items-center justify-between mt-2">
          <Bone className="h-7 w-20" />
          <Bone className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Columna texto */}
          <div className="flex flex-col items-center lg:items-start gap-6">
            <Bone className="h-6 w-36" />
            <Bone className="h-12 w-full max-w-md" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-4/5" />
            <Bone className="h-11 w-36 rounded-md" />
            {/* Stats */}
            <div className="w-full rounded-xl overflow-hidden border border-border flex flex-col sm:flex-row gap-px">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 flex flex-col items-center py-5 px-4 gap-2 bg-terra-50">
                  <Bone className="h-7 w-12" />
                  <Bone className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
          {/* Imagen */}
          <Bone className="w-full aspect-[4/3] rounded-xl" />
        </div>
      </section>

      {/* Catálogo */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 flex flex-col gap-3">
            <Bone className="h-9 w-28" />
            <Bone className="h-[3px] w-24 rounded-full" />
            <Bone className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)}
          </div>
        </div>
      </section>
    </div>
  )
}
