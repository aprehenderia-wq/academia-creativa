import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminCourseForm } from '@/components/admin-course-form'

export const metadata: Metadata = {
  title: 'Nuevo curso',
}

export default function NuevoCursoPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/cursos"
          className="text-caption font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver a cursos
        </Link>
        <h1 className="mt-3 font-serif font-semibold text-h1 text-foreground">
          Nuevo curso
        </h1>
        <p className="mt-1 text-small text-muted-foreground">
          Completa los campos para crear un curso. Podrás añadir secciones y lecciones después.
        </p>
      </div>

      <AdminCourseForm />
    </div>
  )
}
