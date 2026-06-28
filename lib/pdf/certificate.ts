import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// Colores del sistema de diseño
const TERRA = rgb(0.77, 0.30, 0.15)   // terra-600
const DARK  = rgb(0.08, 0.08, 0.08)   // foreground
const GREY  = rgb(0.45, 0.45, 0.45)   // muted-foreground
const LIGHT = rgb(0.60, 0.60, 0.60)   // caption

export async function generateCertificatePdf({
  studentName,
  courseTitle,
  issuedAt,
  certificateCode,
}: {
  studentName: string
  courseTitle: string
  issuedAt: string
  certificateCode: string
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()

  // A4 horizontal (paisaje): 841.89 × 595.28 puntos
  const page = pdfDoc.addPage([841.89, 595.28])
  const { width, height } = page.getSize()

  const serif     = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const serifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const sans      = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Fondo crema suave
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.99, 0.97, 0.94) })

  // Borde decorativo exterior
  page.drawRectangle({
    x: 24, y: 24, width: width - 48, height: height - 48,
    borderColor: TERRA, borderWidth: 2,
    opacity: 0, borderOpacity: 1,
  })
  // Borde interior fino
  page.drawRectangle({
    x: 32, y: 32, width: width - 64, height: height - 64,
    borderColor: TERRA, borderWidth: 0.5,
    opacity: 0, borderOpacity: 0.5,
  })

  // ── Encabezado ──────────────────────────────────────────────────────────────

  const brandText = 'Academia Creativa'
  const brandSize = 20
  page.drawText(brandText, {
    x: width / 2 - serif.widthOfTextAtSize(brandText, brandSize) / 2,
    y: height - 88,
    size: brandSize,
    font: serif,
    color: TERRA,
  })

  const titleText = 'Certificado de Finalizacion'
  const titleSize = 34
  page.drawText(titleText, {
    x: width / 2 - serifBold.widthOfTextAtSize(titleText, titleSize) / 2,
    y: height - 144,
    size: titleSize,
    font: serifBold,
    color: DARK,
  })

  // Separador
  page.drawLine({
    start: { x: width / 2 - 110, y: height - 166 },
    end:   { x: width / 2 + 110, y: height - 166 },
    thickness: 1,
    color: TERRA,
    opacity: 0.6,
  })

  // ── Cuerpo ──────────────────────────────────────────────────────────────────

  const certifyText = 'Se certifica que'
  const certifySize = 13
  page.drawText(certifyText, {
    x: width / 2 - sans.widthOfTextAtSize(certifyText, certifySize) / 2,
    y: height - 208,
    size: certifySize,
    font: sans,
    color: GREY,
  })

  // Nombre del alumno — texto grande, central
  const nameSize = 40
  // Recortar si el nombre es muy largo para que quepa
  const maxNameWidth = width - 120
  let displayName = studentName
  while (
    serifBold.widthOfTextAtSize(displayName, nameSize) > maxNameWidth &&
    displayName.length > 3
  ) {
    displayName = displayName.slice(0, -1)
  }
  if (displayName !== studentName) displayName += '...'

  page.drawText(displayName, {
    x: width / 2 - serifBold.widthOfTextAtSize(displayName, nameSize) / 2,
    y: height - 268,
    size: nameSize,
    font: serifBold,
    color: DARK,
  })

  const completedText = 'ha completado con exito el curso:'
  const completedSize = 13
  page.drawText(completedText, {
    x: width / 2 - sans.widthOfTextAtSize(completedText, completedSize) / 2,
    y: height - 312,
    size: completedSize,
    font: sans,
    color: GREY,
  })

  // Título del curso — también recortado si es muy largo
  const courseSize = 26
  const maxCourseWidth = width - 120
  let displayCourse = courseTitle
  while (
    serif.widthOfTextAtSize(displayCourse, courseSize) > maxCourseWidth &&
    displayCourse.length > 3
  ) {
    displayCourse = displayCourse.slice(0, -1)
  }
  if (displayCourse !== courseTitle) displayCourse += '...'

  page.drawText(displayCourse, {
    x: width / 2 - serif.widthOfTextAtSize(displayCourse, courseSize) / 2,
    y: height - 358,
    size: courseSize,
    font: serif,
    color: DARK,
  })

  // ── Pie ─────────────────────────────────────────────────────────────────────

  const date = new Date(issuedAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
  const dateText = `Emitido el ${date}`
  const dateSize = 11
  page.drawText(dateText, {
    x: width / 2 - sans.widthOfTextAtSize(dateText, dateSize) / 2,
    y: height - 430,
    size: dateSize,
    font: sans,
    color: GREY,
  })

  // Código de verificación (esquina inferior derecha)
  const codeText = `Codigo de verificacion: ${certificateCode}`
  const codeSize = 8
  page.drawText(codeText, {
    x: width - 48 - sans.widthOfTextAtSize(codeText, codeSize),
    y: 48,
    size: codeSize,
    font: sans,
    color: LIGHT,
  })

  return pdfDoc.save()
}
