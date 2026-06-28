import Link from 'next/link'
import { getAdminCourses } from '@/lib/services/admin'

function formatPrice(cents: number, currency: string): string {
  if (cents === 0) return 'Gratis'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  published: { label: 'Publicado', className: 'bg-success-bg text-accent' },
  draft:     { label: 'Borrador',  className: 'bg-terra-50 text-terra-700' },
}

export default async function AdminCursos() {
  const courses = await getAdminCourses()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="font-serif font-semibold text-h1 text-foreground">Cursos</h1>
          <span className="text-small text-muted-foreground">{courses.length} en total</span>
        </div>
        <Link
          href="/admin/cursos/nuevo"
          className="shrink-0 bg-primary-button hover:bg-primary-strong hover:shadow-md active:scale-95 text-white text-small font-medium px-4 py-2 rounded-lg transition-all duration-200"
        >
          + Nuevo curso
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-terra-50">
                <th className="text-left text-caption font-medium text-muted-foreground px-4 py-3">
                  Nombre
                </th>
                <th className="text-left text-caption font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                  Categoría
                </th>
                <th className="text-left text-caption font-medium text-muted-foreground px-4 py-3">
                  Precio
                </th>
                <th className="text-left text-caption font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                  Estado
                </th>
                <th className="text-right text-caption font-medium text-muted-foreground px-4 py-3">
                  Matriculados
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-small text-muted-foreground">
                    No hay cursos todavía.
                  </td>
                </tr>
              ) : (
                courses.map((c) => {
                  const status = STATUS_LABELS[c.status] ?? { label: c.status, className: 'bg-terra-50 text-terra-700' }
                  return (
                    <tr key={c.id} className="hover:bg-background transition-colors">
                      <td className="px-4 py-3 text-small font-medium text-foreground">
                        {c.title}
                      </td>
                      <td className="px-4 py-3 text-small text-muted-foreground hidden sm:table-cell">
                        {c.category ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-small text-foreground font-medium">
                        {formatPrice(c.price_cents, c.currency)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-caption font-medium px-2 py-1 rounded-md ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-serif font-semibold text-h3 text-foreground">
                          {c.enrollment_count}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
