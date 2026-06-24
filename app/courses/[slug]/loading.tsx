export default function CourseDetailLoading() {
  return (
    <main className="min-h-screen bg-background animate-pulse">

      {/* Portada */}
      <div
        className="flex flex-col justify-between px-6 py-10 lg:px-16 lg:py-16 bg-gray-200"
        style={{ minHeight: "260px" }}
      >
        <div className="h-3 w-16 bg-gray-300 rounded" />
        <div className="mt-6 h-9 w-3/4 bg-gray-300 rounded lg:max-w-3xl" />
      </div>

      {/* Contenido */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">

          {/* Columna principal */}
          <div className="lg:col-span-2">

            {/* Badge + descripción */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="h-5 w-20 bg-gray-200 rounded-md" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Precio + botón — solo móvil */}
            <div className="flex items-center justify-between py-5 border-y border-border mb-10 lg:hidden">
              <div className="h-7 w-24 bg-gray-200 rounded" />
              <div className="h-10 w-28 bg-gray-200 rounded-lg" />
            </div>

            {/* Temario */}
            <div className="flex flex-col gap-4">
              <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
              {[1, 2].map((i) => (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-gray-100 px-5 py-4 space-y-2">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                    <div className="h-5 w-48 bg-gray-200 rounded" />
                  </div>
                  <div className="divide-y divide-border">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex items-center gap-4 px-5 py-3.5">
                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                        <div className="h-4 w-40 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar — solo desktop */}
          <aside className="hidden lg:block">
            <div className="border border-border rounded-xl p-6 bg-card flex flex-col gap-5">
              <div className="space-y-2">
                <div className="h-3 w-12 bg-gray-200 rounded" />
                <div className="h-10 w-28 bg-gray-200 rounded" />
              </div>
              <div className="h-11 w-full bg-gray-200 rounded-lg" />
              <div className="h-3 w-40 bg-gray-200 rounded mx-auto" />
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
