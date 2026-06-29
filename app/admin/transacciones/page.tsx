import { getAdminTransactions } from '@/lib/services/admin'

function formatPrice(cents: number, currency: string): string {
  if (cents === 0) return 'Gratis'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function AdminTransacciones() {
  const transactions = await getAdminTransactions()

  return (
    <div>
      <div className="mb-8 flex items-baseline gap-3">
        <h1 className="font-serif font-semibold text-h1 text-foreground">Transacciones</h1>
        <span className="text-small text-muted-foreground">
          {transactions.length > 0 ? `${transactions.length} más recientes` : ''}
        </span>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-terra-50">
                <th className="text-left text-caption font-medium text-muted-foreground px-4 py-3">
                  Alumno
                </th>
                <th className="text-left text-caption font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                  Curso
                </th>
                <th className="text-left text-caption font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                  Fecha
                </th>
                <th className="text-right text-caption font-medium text-muted-foreground px-4 py-3">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-small text-muted-foreground">
                    No hay transacciones todavía.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-background transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-small font-medium text-foreground">
                        {t.student_name ?? <span className="italic text-muted-foreground">Sin nombre</span>}
                      </p>
                      {t.student_email && (
                        <p className="text-caption text-muted-foreground">{t.student_email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-small text-foreground hidden sm:table-cell">
                      {t.course_title}
                    </td>
                    <td className="px-4 py-3 text-small text-muted-foreground hidden md:table-cell">
                      {formatDate(t.enrolled_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-serif font-semibold text-foreground">
                        {formatPrice(t.price_cents, t.currency)}
                      </span>
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
