# Cuatro mejoras construidas con Claude Code

> Documento del reto. Describe las cuatro mejoras implementadas con
> Claude Code que van más allá del MVP básico: el problema que resolvían,
> por qué se usó Claude Code, el prompt que lo originó y el resultado.

---

## Mejora 1 — Gestión segura de secretos

### Problema

Al conectar la plataforma a Stripe, Resend y Supabase, es necesario manejar
claves de API privadas. Sin una configuración correcta, esas claves podrían
subirse accidentalmente a GitHub y quedar expuestas públicamente — un error
de seguridad crítico que invalida las cuentas y puede generar cargos no
autorizados.

Configurar `.gitignore` correctamente, decidir qué variables son públicas
y cuáles secretas, y crear una plantilla para el equipo son tareas que
requieren conocer en detalle cómo funciona Next.js, Supabase y el resto del
stack. Sin ese conocimiento, es fácil cometer errores.

### Por qué Claude Code

Configurar esto manualmente habría requerido:
1. Saber qué archivos excluir de Git para un proyecto Next.js + Supabase.
2. Decidir cuál de las claves de Supabase es pública (anon key) y cuál
   es secreta (service_role key) — una distinción no obvia para alguien nuevo.
3. Entender que las variables `NEXT_PUBLIC_*` se incrustan en el bundle del
   navegador y las demás no.
4. Crear una plantilla `.env.example` útil, con comentarios, para que cualquier
   persona que clone el repositorio sepa qué necesita configurar.

Claude Code hizo todo esto en una sola petición, aplicando las mejores
prácticas del stack de forma coherente.

### Prompt usado

> [Prompt representativo basado en los commits de la Fase 1]
>
> *"Vamos a conectar Supabase al proyecto. Necesito que configures el
> .gitignore para que los archivos .env no se suban a GitHub, y que crees
> un .env.example con todas las variables que vamos a necesitar
> (Supabase, Stripe, Resend) explicando para qué sirve cada una y
> cuáles son públicas vs secretas."*

### Resultado

**Archivos creados/modificados:**

- `.gitignore` — excluye `.env`, `.env.local`, `.env.*.local` y los archivos
  de build de Next.js (`.next/`).
- `.env.example` — plantilla con 11 variables organizadas en secciones
  (Supabase, Stripe, Resend, App, Admin, Bunny.net), con comentarios que
  explican dónde obtener cada valor y cuáles son secretas.

**Estructura de seguridad resultante:**

```
Variables públicas (NEXT_PUBLIC_*)       → Pueden ir al navegador
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  NEXT_PUBLIC_APP_URL

Variables secretas (sin prefijo)         → Solo existen en el servidor
  SUPABASE_SERVICE_ROLE_KEY              ← Salta RLS — la más sensible
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  RESEND_API_KEY
  ADMIN_API_KEY
  BUNNY_API_KEY
  BUNNY_TOKEN_AUTH_KEY
```

A lo largo del proyecto, Claude Code reforzó esta separación: los archivos
`lib/stripe.ts`, `lib/bunny.ts` y `lib/supabase/server.ts` llevan la directiva
`import 'server-only'`, que hace que Next.js lance un error de compilación si
alguien intenta importarlos desde el navegador por error.

---

## Mejora 2 — Vídeo protegido con URLs firmadas de Bunny.net

### Problema

Una plataforma de cursos de pago necesita proteger su contenido. Si los vídeos
tuvieran URLs públicas permanentes, cualquier persona podría compartir el enlace
y acceder sin pagar. Necesitábamos un reproductor de vídeo que:

1. Solo mostrara el contenido a alumnas con matrícula activa.
2. Generara URLs de vídeo que caducaran, de modo que compartirlas fuera inútil.
3. No revelara las claves de Bunny.net al navegador.

Integrar un sistema de streaming con token authentication, generación de firmas
SHA-256 y validación de acceso mediante RLS de Supabase es una tarea compleja
que une criptografía, seguridad de base de datos y lógica de servidor.

### Por qué Claude Code

Esta mejora requería coordinar cuatro sistemas a la vez: Bunny.net (firma de
URLs), Supabase (verificación de matrícula vía RLS), Next.js (API route de
servidor) y el componente de React del aula. Un error en cualquier punto del
flujo habría dejado el contenido desprotegido o inaccesible.

Claude Code diseñó toda la cadena de seguridad como un sistema coherente, con
manejo de errores en cada paso y sin exponer información sensible.

### Prompt usado

> [Prompt representativo basado en los commits de la Fase 6]
>
> *"Necesito implementar el aula de vídeo con protección de contenido.
> Los vídeos están en Bunny.net con Token Authentication activado. Quiero
> que: (1) solo las alumnas matriculadas puedan ver el vídeo, usando RLS
> de Supabase para verificarlo; (2) el servidor genere una URL firmada con
> SHA-256 que caduque en 4 horas; (3) la clave de firma nunca salga del
> servidor. Crea la API route, el componente del aula y el módulo de Bunny."*

### Resultado

**Flujo completo implementado:**

```
Alumna abre el aula
        │
        ▼
classroom.tsx (Cliente)
  → GET /api/video/signed-url?lesson_id=<id>
        │
        ▼
Route handler — lib/bunny.ts
  1. Verifica sesión activa
  2. Consulta la lección con createSessionClient()
     → Si RLS no devuelve la fila (no matriculada) → 403
  3. Genera token SHA-256:
     hash(BUNNY_TOKEN_AUTH_KEY + videoId + expires)
  4. Construye URL:
     https://iframe.mediadelivery.net/embed/<lib>/<id>?token=<hash>&expires=<ts>
  5. Cache-Control: no-store (la URL es personal y caduca)
        │
        ▼
classroom.tsx
  → Renderiza <iframe> con la URL firmada
  → La URL caduca en 4 horas
```

**Archivos creados:**
- `lib/bunny.ts` — `buildSignedEmbedUrl()` (pura, testeable), `getBunnyConfig()`,
  `signLessonVideoUrl()` (lee el entorno y genera la firma)
- `app/api/video/signed-url/route.ts` — GET handler con verificación de sesión
  y consulta RLS
- `app/learn/[slug]/classroom.tsx` — componente del aula con reproductor de
  iframe y lista de lecciones
- `app/learn/[slug]/page.tsx` — wrapper de página
- Tests en `__tests__/services/bunny.test.ts` que verifican la firma determinista

---

## Mejora 3 — Certificados PDF generados al completar el curso

### Problema

No había ningún mecanismo para reconocer que una alumna había terminado un
curso. Faltaba:

1. Una tabla `certificates` en la base de datos.
2. Un botón para marcar cada lección como completada.
3. Lógica para detectar el 100% de completación y emitir el certificado.
4. Generación del PDF con nombre, curso, fecha y código verificable.
5. Un endpoint para descargar el PDF desde el dashboard.

Construir este flujo de extremo a extremo requería tocar cinco capas del
sistema (base de datos, migración, servicio, API route y componente de UI)
de forma coherente y segura.

### Por qué Claude Code

La generación de PDF en el servidor (sin servicios externos) con `pdf-lib`,
la lógica de detección de completación cruzando `lesson_progress` con el
total de lecciones del curso, y la seguridad de que solo el servidor puede
emitir certificados (igual que con las matrículas) son detalles que Claude
Code resolvió de forma integrada.

Además, el código de certificado (`ACAD-2026-XXXXXXXX`) es único gracias a
`crypto.randomUUID()` — Claude Code eligió esta solución porque es nativa de
Node.js y no requiere dependencias adicionales.

### Prompt usado

> [Prompt representativo basado en los commits de la Fase 7]
>
> *"Quiero añadir certificados de finalización. Cuando una alumna complete
> el 100% de las lecciones de un curso, se debe emitir un certificado
> automáticamente. Necesito: (1) migración SQL para la tabla certificates
> con RLS; (2) botón en el aula para marcar lección como completada;
> (3) lógica que detecte el 100% y emita el certificado con service_role;
> (4) generación de PDF con pdf-lib (nombre, curso, fecha, código único);
> (5) endpoint de descarga protegido. El certificado no se puede crear
> desde el navegador."*

### Resultado

**Flujo completo implementado:**

```
Alumna marca lección como completada
        │ Server Action: markLessonComplete()
        ▼
lesson_progress ← INSERT (user_id, lesson_id)
        │
        ▼ ¿100% completado?
  Si sí: issueCertificate(userId, courseId)
          → INSERT en certificates con código ACAD-YYYY-XXXXXXXX
          → idempotente: si ya existe, devuelve el ID existente
        │
        ▼
Dashboard de la alumna
  → Muestra el certificado con botón "Descargar PDF"
        │
        ▼
GET /api/certificates/[id]/download
  1. Verifica sesión
  2. Verifica que el certificado pertenece a la alumna
  3. Llama a generateCertificatePdf() con pdf-lib
  4. Devuelve el PDF con Content-Disposition: attachment
```

**Archivos creados/modificados:**
- `supabase/migrations/20260628_certificates.sql` — tabla + RLS policy
- `lib/services/certificates.ts` — `issueCertificate()`, `getUserCertificates()`,
  `getCertificateForDownload()`
- `lib/pdf/certificate.ts` — PDF A4 horizontal con bordes decorativos, tipografía
  serif, colores del sistema de diseño y código de verificación
- `app/api/certificates/[id]/download/route.ts` — GET handler
- `app/actions/lessons.ts` — Server Action para marcar lección y emitir certificado
- Actualización del dashboard para mostrar certificados

---

## Mejora 4 — Suite de tests automáticos con Vitest (33 tests)

### Problema

Cuando se construye con IA, cada nueva funcionalidad puede introducir cambios
colaterales que rompen algo que ya funcionaba — y si no hay tests, esos
errores solo se descubren cuando una alumna real los encuentra.

El riesgo era especialmente alto con las funciones de la capa de servicios
(`lib/services/`): la lógica de autenticación, los constructores de email, la
detección de inactividad y la creación de cursos son funciones que interactúan
entre sí. Un cambio en `enrollments.ts` podría romper la función de inactividad
sin que nadie lo notara.

### Por qué Claude Code

Configurar Vitest en un proyecto Next.js 16 con TypeScript requiere ajustar
`vitest.config.ts`, elegir el entorno correcto (`jsdom` vs `node`), y estructurar
los mocks para que las pruebas sean deterministas sin necesitar una base de datos
real. Claude Code hizo esta configuración inicial y diseñó una estrategia de
tests orientada a la lógica de negocio, no a los detalles de implementación.

A lo largo del proyecto, cada funcionalidad nueva llegó acompañada de sus tests.

### Prompt usado

> [Prompt representativo basado en el commit `ef57230`]
>
> *"Configura Vitest en el proyecto y añade tests para las partes más
> críticas: errores de autenticación (que los mensajes de error en español
> sean correctos), constructores de email (que el HTML incluya los datos
> del alumno y el enlace), y matrículas (que getEnrolledCourses calcule
> bien el progreso). Los tests no deben necesitar Supabase real — usa mocks."*

### Resultado

**6 archivos de tests — 33 tests en total:**

| Archivo | Qué prueba | Tests |
|---|---|---|
| `auth-errors.test.ts` | `translateAuthError()`: que cada error de Supabase produce el mensaje en español correcto | 6 |
| `email-builders.test.ts` | `buildWelcomeEmailHtml()`, `buildPurchaseEmailHtml()`, `buildInactivityReminderHtml()`: que el HTML contiene nombre, curso y enlace | 8 |
| `enrollments.test.ts` | `getEnrolledCourses()`: cálculo de progreso (0%, parcial, 100%), cursos sin lecciones, múltiples cursos | 7 |
| `bunny.test.ts` | `buildSignedEmbedUrl()`: que la firma SHA-256 es determinista y la URL tiene el formato correcto | 5 |
| `admin-create-course.test.ts` | `createCourse()`: creación exitosa, slug duplicado, campos opcionales, validación de price_cents | 5 |
| `setup.test.ts` | Configuración del entorno de tests (jsdom, variables de entorno mock) | 2 |

**Ejecución:**
```bash
npm test
# Test Files  6 passed (6)
#       Tests  33 passed (33)
#    Duration  2.60s
```

Los tests se ejecutan con mocks de Supabase — no necesitan conexión a internet
ni credenciales reales, lo que los hace rápidos y reproducibles en cualquier
máquina.
