import { getAdminStudents } from '@/lib/services/admin'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function AdminAlumnos() {
  const students = await getAdminStudents()

  return (
    <div>
      <div className="mb-8 flex items-baseline gap-3">
        <h1 className="font-serif font-semibold text-h1 text-foreground">Alumnos</h1>
        <span className="text-small text-muted-foreground">{students.length} registrados</span>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-terra-50">
                <th className="text-left text-caption font-medium text-muted-foreground px-4 py-3">
                  Nombre
                </th>
                <th className="text-left text-caption font-medium text-muted-foreground px-4 py-3">
                  Email
                </th>
                <th className="text-left text-caption font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                  Cursos
                </th>
                <th className="text-left text-caption font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                  Última matrícula
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-small text-muted-foreground">
                    No hay alumnos registrados todavía.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-background transition-colors">
                    <td className="px-4 py-3 text-small font-medium text-foreground">
                      {s.full_name ?? <span className="text-muted-foreground italic">Sin nombre</span>}
                    </td>
                    <td className="px-4 py-3 text-small text-muted-foreground">
                      {s.email ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {s.course_count === 0 ? (
                        <span className="text-small text-muted-foreground">Ninguno</span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-small font-medium text-foreground">
                            {s.course_count} {s.course_count === 1 ? 'curso' : 'cursos'}
                          </span>
                          {s.course_titles.length > 0 && (
                            <span className="text-caption text-muted-foreground line-clamp-1">
                              {s.course_titles.join(', ')}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-small text-muted-foreground hidden md:table-cell">
                      {s.latest_enrollment ? formatDate(s.latest_enrollment) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
