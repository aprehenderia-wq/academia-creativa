// Skeleton del detalle de curso: portada + grid de info + tarjeta de precio
function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-border ${className ?? ''}`} />
}

export default function CourseDetailLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">

      {/* Portada */}
      <div className="w-full animate-pulse rounded-none bg-border" style={{ minHeight: '300px' }} />

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-10">

          {/* Columna principal (2/3) */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Badges */}
            <div className="flex gap-2">
              <Bone className="h-6 w-24" />
              <Bone className="h-6 w-20" />
            </div>

            {/* Título y descripción */}
            <div className="flex flex-col gap-3">
              <Bone className="h-9 w-3/4" />
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-5/6" />
              <Bone className="h-4 w-4/6" />
            </div>

            {/* Lo que aprenderás */}
            <div className="flex flex-col gap-4">
              <Bone className="h-6 w-52" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <Bone className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
                    <Bone className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Temario */}
            <div className="flex flex-col gap-4">
              <Bone className="h-6 w-36" />
              {[1, 2, 3].map((mod) => (
                <div key={mod} className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-terra-50 px-5 py-3 flex justify-between items-center">
                    <Bone className="h-5 w-48" />
                    <Bone className="h-4 w-12" />
                  </div>
                  <div className="divide-y divide-border">
                    {[1, 2].map((les) => (
                      <div key={les} className="flex items-center gap-3 px-5 py-3">
                        <Bone className="h-4 w-4 rounded-full shrink-0" />
                        <Bone className="h-4 flex-1" />
                        <Bone className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Sidebar — tarjeta de precio (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-border rounded-xl p-6 bg-card flex flex-col gap-5">
              <Bone className="h-4 w-24" />
              <Bone className="h-10 w-36" />
              <Bone className="h-11 w-full rounded-lg" />
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Bone className="h-4 w-4 rounded-full shrink-0" />
                    <Bone className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
