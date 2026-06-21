import { CourseCardSkeleton } from "@/components/course-card-skeleton"

export default function CoursesLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-5 w-64 bg-gray-200 rounded animate-pulse" />
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  )
}
