import 'server-only'

import { createHash } from 'node:crypto'

// ============================================================================
// Firmado de URLs de Bunny.net Stream (vídeo protegido)
// ----------------------------------------------------------------------------
// Bunny permite "Token Authentication" en la biblioteca de Stream: el reproductor
// (iframe embed) solo carga si la URL lleva un token válido y una fecha de
// expiración. Así, aunque alguien copie el enlace, dejará de funcionar al
// caducar y no se puede falsificar sin la clave secreta.
//
// El token es el SHA-256 (en hexadecimal) de la concatenación:
//   tokenAuthKey + videoId + expires
// donde `expires` es una marca de tiempo UNIX en SEGUNDOS.
// ============================================================================

// Base del iframe embed de Bunny Stream.
const EMBED_BASE = 'https://iframe.mediadelivery.net/embed'

// Duración de validez de cada URL firmada: 4 horas (en segundos).
export const SIGNED_URL_TTL_SECONDS = 4 * 60 * 60

export type BunnyEmbedParams = {
  libraryId: string
  videoId: string
  tokenAuthKey: string
  // Marca de tiempo UNIX (en segundos) en la que el enlace deja de ser válido.
  expires: number
}

// Construye la URL firmada del iframe embed para un vídeo concreto.
// Función PURA (no lee el entorno ni la hora): recibe todo por parámetro para
// que sea fácil de testear de forma determinista.
export function buildSignedEmbedUrl({
  libraryId,
  videoId,
  tokenAuthKey,
  expires,
}: BunnyEmbedParams): string {
  const token = createHash('sha256')
    .update(`${tokenAuthKey}${videoId}${expires}`)
    .digest('hex')

  return `${EMBED_BASE}/${libraryId}/${videoId}?token=${token}&expires=${expires}`
}

// Lee la configuración de Bunny desde las variables de entorno.
// Lanza un error claro si falta algo, para fallar de forma evidente en el
// servidor en vez de generar URLs inválidas que darían un 403 en el reproductor.
export function getBunnyConfig(): { libraryId: string; tokenAuthKey: string } {
  const libraryId = process.env.BUNNY_LIBRARY_ID
  const tokenAuthKey = process.env.BUNNY_TOKEN_AUTH_KEY

  if (!libraryId || !tokenAuthKey) {
    throw new Error(
      'Faltan BUNNY_LIBRARY_ID o BUNNY_TOKEN_AUTH_KEY en el entorno.'
    )
  }

  return { libraryId, tokenAuthKey }
}

// Firma la URL del vídeo de una lección usando la configuración del entorno y
// la hora actual (caduca en SIGNED_URL_TTL_SECONDS). Es la función que usan
// tanto la ruta API como la página del aula. Lanza si falta configuración.
export function signLessonVideoUrl(videoId: string): string {
  const { libraryId, tokenAuthKey } = getBunnyConfig()
  const expires = Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS
  return buildSignedEmbedUrl({ libraryId, videoId, tokenAuthKey, expires })
}
