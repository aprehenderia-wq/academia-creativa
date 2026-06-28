import { NextRequest } from 'next/server'
import { createSessionClient } from '@/lib/supabase/server'
import { getCertificateForDownload } from '@/lib/services/certificates'
import { generateCertificatePdf } from '@/lib/pdf/certificate'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('No autenticado', { status: 401 })
  }

  const { id } = await params

  const cert = await getCertificateForDownload(id, user.id)

  if (!cert) {
    return new Response('Certificado no encontrado', { status: 404 })
  }

  const pdfBytes = await generateCertificatePdf({
    studentName: cert.student_name,
    courseTitle: cert.course_title,
    issuedAt: cert.issued_at,
    certificateCode: cert.certificate_code,
  })

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${cert.certificate_code}.pdf"`,
    },
  })
}
