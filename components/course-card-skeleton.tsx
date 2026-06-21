export function CourseCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
      {/* Portada */}
      <div className="bg-gray-200" style={{ aspectRatio: "16 / 10" }} />

      <div className="p-5 flex flex-col gap-3">
        {/* Badge */}
        <div className="h-5 w-20 bg-gray-200 rounded-md" />

        {/* Título */}
        <div className="space-y-2">
          <div className="h-5 w-full bg-gray-200 rounded" />
          <div className="h-5 w-3/4 bg-gray-200 rounded" />
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
        </div>

        {/* Precio + botón */}
        <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
          <div className="h-6 w-16 bg-gray-200 rounded" />
          <div className="h-9 w-28 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
