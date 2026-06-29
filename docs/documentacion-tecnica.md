# Documentación Técnica — Academia Creativa

> Guía para desarrolladores. Explica la arquitectura, el modelo de datos,
> las variables de entorno y cómo poner el proyecto en marcha desde cero.

---

## 1. Arquitectura general

Academia Creativa es un **monolito Next.js**: el frontend (páginas) y el
backend (API, acceso a base de datos, emails) viven en el mismo repositorio y
se despliegan juntos en Vercel. No hay un servidor separado.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Navegador (alumna)                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────────┐
│                     Vercel — Next.js 16                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ App Router   │  │ API Routes   │  │ Server Components    │   │
│  │ (páginas)    │  │ /api/*       │  │ (SSR + auth checks)  │   │
│  └──────────────┘  └──────┬───────┘  └──────────────────────┘   │
└─────────────────────────── │ ────────────────────────────────────┘
                             │
        ┌────────────────────┼──────────────────────┐
        │                    │                       │
┌───────▼──────┐  ┌─────────▼────────┐  ┌──────────▼───────────┐
│  Supabase    │  │   Stripe         │  │  Bunny.net Stream    │
│  - Postgres  │  │   - Checkout     │  │  - Video protegido   │
│  - Auth JWT  │  │   - Webhooks     │  │  - URLs firmadas     │
│  - RLS       │  │   - Dashboard    │  │  - Token auth        │
└──────────────┘  └──────────────────┘  └──────────────────────┘
        │
┌───────▼──────────┐
│  Resend          │
│  - Emails trans. │
│  - Bienvenida    │
│  - Confirmación  │
│  - Inactividad   │
└──────────────────┘
```

**Flujo de una compra:**
1. Alumna hace clic en "Comprar" → `POST /api/checkout` crea una sesión de Stripe.
2. Stripe redirige al checkout; alumna paga.
3. Stripe llama a `POST /api/webhooks/stripe` con el evento `checkout.session.completed`.
4. El webhook verifica la firma, inserta en `enrollments` con `service_role` (salta RLS) y envía email de confirmación vía Resend.
5. Alumna accede al curso; cada vídeo pide una URL firmada a `GET /api/video/signed-url`, que la genera en el servidor con la clave de Bunny.net.

---

## 2. Estructura del proyecto

```
academia-creativa/
│
├── app/                    ← Rutas y páginas (Next.js App Router)
│   ├── page.tsx            ← Home: hero + catálogo
│   ├── layout.tsx          ← Layout raíz (navbar, footer, fonts)
│   ├── globals.css         ← Variables CSS del sistema de diseño
│   │
│   ├── auth/
│   │   ├── login/          ← Página de inicio de sesión
│   │   ├── register/       ← Página de registro
│   │   └── actions.ts      ← Server Action: crear perfil tras registro
│   │
│   ├── courses/
│   │   ├── page.tsx        ← Catálogo público
│   │   └── [slug]/         ← Detalle del curso + botón de compra
│   │
│   ├── learn/[slug]/       ← Aula: reproductor de vídeo + lista de lecciones
│   ├── dashboard/          ← Dashboard de la alumna (protegido)
│   ├── checkout/
│   │   ├── success/        ← Página de pago exitoso
│   │   └── cancel/         ← Página de pago cancelado
│   │
│   ├── admin/              ← Panel de administración (rol admin requerido)
│   │   ├── page.tsx        ← Dashboard: cursos publicados, alumnos, matrículas
│   │   ├── layout.tsx      ← Comprueba sesión + rol admin; redirige si no
│   │   ├── alumnos/        ← Tabla de alumnos con sus cursos
│   │   ├── cursos/         ← Lista de cursos + formulario de nuevo curso
│   │   └── transacciones/  ← Últimas 100 matrículas/compras
│   │
│   └── api/
│       ├── checkout/       ← POST: crea sesión de Stripe
│       ├── webhooks/stripe/← POST: webhook de Stripe (matricula + email)
│       ├── video/signed-url← GET: URL firmada de Bunny.net (requiere matrícula)
│       ├── certificates/[id]/download/ ← GET: descarga PDF del certificado
│       └── admin/
│           ├── courses/    ← POST: crea curso (requiere rol admin)
│           └── send-reminders/ ← POST: envía emails de inactividad (API key)
│
├── components/             ← Componentes React reutilizables
│   ├── navbar.tsx          ← Barra de navegación con estado de sesión
│   ├── footer.tsx
│   ├── logo.tsx            ← Componente de logo (SVG + texto)
│   ├── page-wrapper.tsx    ← Contenedor de layout con max-width
│   ├── mobile-menu.tsx     ← Menú hamburguesa para móvil
│   ├── admin-nav.tsx       ← Sidebar de navegación del panel admin
│   ├── auth/               ← Formularios de login, registro y botón de logout
│   ├── courses/            ← Tarjetas de curso (catálogo y dashboard)
│   ├── admin/              ← Formulario de creación de cursos
│   └── ui/                 ← Componentes genéricos (FadeIn)
│
├── lib/                    ← Lógica de negocio y utilidades de servidor
│   ├── supabase/
│   │   ├── client.ts       ← Cliente anon para el navegador
│   │   └── server.ts       ← createAdminClient() y createSessionClient()
│   ├── stripe.ts           ← Instancia de Stripe (server-only)
│   ├── bunny.ts            ← Firmado de URLs de Bunny.net (server-only)
│   ├── constants/          ← Categorías, niveles y colores de cursos
│   ├── pdf/certificate.ts  ← Generación de PDF con pdf-lib
│   └── services/           ← Capa de servicio (toda la lógica de negocio)
│       ├── auth.ts         ← signUp, signIn, signOut, traducción de errores
│       ├── courses.ts      ← Consultas de cursos (catálogo, detalle, temario)
│       ├── enrollments.ts  ← Matrículas, progreso, alumnos inactivos
│       ├── admin.ts        ← Stats del dashboard, listas, createCourse()
│       ├── certificates.ts ← Emisión y descarga de certificados
│       └── email.ts        ← Plantillas HTML + envío con Resend
│
├── supabase/
│   ├── schema.sql          ← Esquema completo: tablas + RLS policies
│   ├── seed.sql            ← Datos de ejemplo (opcional)
│   └── migrations/
│       └── 20260628_certificates.sql ← Tabla certificates
│
├── docs/                   ← Documentación del proyecto
├── public/                 ← Assets estáticos (imágenes, SVGs, favicon)
├── __tests__/              ← Tests unitarios con Vitest
└── scripts/                ← Scripts de utilidad (seed de datos)
```

**Regla de la capa de servicios:** los componentes y páginas nunca importan
Supabase directamente. Todo pasa por `lib/services/*`, que encapsula las
consultas y maneja los errores. Esto facilita testear la lógica sin necesidad
de una base de datos real.

**Dos clientes de Supabase:**
- `createAdminClient()` — usa `service_role`. Salta RLS. Solo en el servidor.
  Se usa para matrículas, emails, stats del admin.
- `createSessionClient()` — usa `anon key` + cookies de sesión. Respeta RLS.
  Se usa para leer datos del usuario autenticado.

---

## 3. Modelo de datos

### Diagrama de relaciones

```
auth.users (Supabase interno)
    │
    ├── profiles (1:1)
    │     id, full_name, email, created_at
    │
    ├── user_roles (1:N)
    │     id, user_id, role (student|admin), created_at
    │
    ├── enrollments (N:M entre users y courses)
    │     id, user_id, course_id, enrolled_at
    │
    ├── lesson_progress (N:M entre users y lessons)
    │     id, user_id, lesson_id, completed_at
    │
    └── certificates (1 por user+course)
          id, user_id, course_id, certificate_code, issued_at

courses
    │
    └── course_sections (1:N, ordenadas por position)
          │
          └── lessons (1:N, ordenadas por position)
                id, section_id, title, video_id, position
```

### Tablas en detalle

#### `profiles`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Igual que `auth.users.id` (relación 1:1) |
| `full_name` | text | Nombre completo del alumno |
| `email` | text | Email (copia de auth.users) |
| `created_at` | timestamptz | Fecha de registro |

#### `user_roles`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | |
| `role` | enum(`student`, `admin`) | |
| `created_at` | timestamptz | |

> Única restricción: `(user_id, role)`. Un usuario no puede tener el mismo rol dos veces.

#### `courses`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `title` | text | Nombre del curso |
| `slug` | text UNIQUE | URL amigable (`branding-desde-cero`) |
| `description` | text | Descripción corta (tarjeta del catálogo) |
| `long_description` | text | Descripción larga (página de detalle) |
| `price_cents` | integer | Precio en céntimos (1990 = 19,90 €) |
| `currency` | text | `eur` por defecto |
| `status` | enum(`draft`, `published`) | `draft` no aparece en el catálogo |
| `category` | text | Branding, Ilustración, Motion Graphics… |
| `level` | text | Básico, Intermedio, Avanzado |
| `instructor_name` | text | Nombre del/la instructora |
| `what_you_learn` | text[] | Lista de puntos de aprendizaje |
| `cover_image` | text | URL de la imagen de portada |
| `stripe_price_id` | text | ID del Price en Stripe (`price_xxx`) |
| `created_at` | timestamptz | |

#### `course_sections`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `course_id` | uuid FK → courses | Cascade delete |
| `title` | text | Nombre de la sección/módulo |
| `position` | integer | Orden de aparición (0, 1, 2…) |
| `created_at` | timestamptz | |

#### `lessons`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `section_id` | uuid FK → course_sections | Cascade delete |
| `title` | text | Nombre de la lección |
| `video_id` | text nullable | ID del vídeo en Bunny.net |
| `position` | integer | Orden dentro de la sección |
| `created_at` | timestamptz | |

#### `enrollments`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | Cascade delete |
| `course_id` | uuid FK → courses | Cascade delete |
| `enrolled_at` | timestamptz | Fecha de la compra |

> Sin política de INSERT desde el cliente. Solo el servidor con `service_role` puede insertar (tras confirmar el pago de Stripe).

#### `lesson_progress`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | |
| `lesson_id` | uuid FK → lessons | |
| `completed_at` | timestamptz | |

> Restricción única `(user_id, lesson_id)`: una lección se marca completada una sola vez.

#### `certificates`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | |
| `course_id` | uuid FK → courses | |
| `certificate_code` | text UNIQUE | Código legible (ej: `ACAD-2026-A1B2C3D4`) |
| `issued_at` | timestamptz | |

> Restricción única `(user_id, course_id)`: un alumno no puede tener dos certificados del mismo curso.

### Función de seguridad `is_admin()`

Función `SECURITY DEFINER` que evita recursión en RLS al consultar `user_roles`.
Se usa en todas las políticas que necesitan saber si el usuario actual es admin.

---

## 4. Variables de entorno

Copiar `.env.example` a `.env.local` y rellenar todos los valores antes de
arrancar el proyecto.

| Variable | Pública | Descripción |
|---|:---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | URL del proyecto Supabase (`https://xxx.supabase.co`). Se expone al navegador. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | Clave anónima de Supabase. Tiene permisos limitados, controlados por RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | ✗ | Clave de servicio. **Salta RLS. Nunca en el navegador.** Solo en el servidor. |
| `STRIPE_SECRET_KEY` | ✗ | Clave secreta de Stripe (`sk_test_…` en desarrollo). Solo servidor. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✓ | Clave pública de Stripe (`pk_test_…`). Puede ir al navegador. |
| `STRIPE_WEBHOOK_SECRET` | ✗ | Secreto para verificar la firma del webhook de Stripe (`whsec_…`). |
| `RESEND_API_KEY` | ✗ | Clave de API de Resend para envío de emails. Solo servidor. |
| `NEXT_PUBLIC_APP_URL` | ✓ | URL base de la app (`http://localhost:3000` en local, URL de producción en Vercel). |
| `ADMIN_API_KEY` | ✗ | Clave secreta para proteger `POST /api/admin/send-reminders`. Generar con `openssl rand -hex 32`. |
| `BUNNY_LIBRARY_ID` | ✗ | ID de la biblioteca de Stream en Bunny.net. |
| `BUNNY_API_KEY` | ✗ | API key de Bunny.net. Solo servidor. |
| `BUNNY_TOKEN_AUTH_KEY` | ✗ | Clave para firmar URLs de vídeo (Token Authentication Key). **Secreta.** |

Las variables `NEXT_PUBLIC_*` se incrustan en el bundle del navegador durante
el build. Las demás solo existen en el entorno de Node.js del servidor y
nunca llegan al cliente.

---

## 5. Cómo arrancar el proyecto en local

### Requisitos previos
- Node.js 20+ y npm
- Cuenta en Supabase, Stripe y (para vídeo) Bunny.net
- Stripe CLI instalado para recibir webhooks en local

### Paso a paso

**1. Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd academia-creativa
```

**2. Instalar dependencias**
```bash
npm install
```

**3. Configurar las variables de entorno**
```bash
cp .env.example .env.local
# Abrir .env.local y rellenar todos los valores
```

**4. Inicializar la base de datos en Supabase**
- Entrar en [app.supabase.com](https://app.supabase.com) → tu proyecto → **SQL Editor**
- Pegar y ejecutar el contenido de `supabase/schema.sql`
- Pegar y ejecutar el contenido de `supabase/migrations/20260628_certificates.sql`

**5. Crear el primer usuario admin**

En el SQL Editor de Supabase, ejecutar (reemplazando el UUID por el del usuario):
```sql
-- Primero registra el usuario en /auth/register para que exista en auth.users
-- Luego obtén su UUID en Authentication → Users y ejecuta:
INSERT INTO public.user_roles (user_id, role)
VALUES ('<uuid-del-usuario>', 'admin');
```

**6. Arrancar el servidor de desarrollo**
```bash
npm run dev
```
Abrir [http://localhost:3000](http://localhost:3000)

**7. Probar pagos con Stripe CLI**

En una terminal separada:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copiar el `whsec_…` que imprime y pegarlo en `STRIPE_WEBHOOK_SECRET` del `.env.local`.

Reiniciar el servidor (`Ctrl+C` y `npm run dev`).

Para simular un pago completado:
```bash
stripe trigger checkout.session.completed
```

**8. Ejecutar tests**
```bash
npm test
```
Los tests están en `__tests__/services/` y usan Vitest + jsdom.

---

## 6. Decisiones técnicas

### 1. Empezar de cero, no migrar el prototipo de Lovable

El prototipo fue útil para definir el alcance visual, pero su código mezclaba
lógica de negocio con componentes UI y usaba patrones incompatibles con el App
Router de Next.js 16. Migrar ese código habría tomado más tiempo que construir
limpio. Se tomó la decisión de usarlo solo como referencia de diseño.

### 2. Next.js App Router como monolito

Se eligió el App Router (frente a Pages Router) por sus Server Components:
permiten hacer consultas a Supabase directamente en el servidor sin exponer
datos ni añadir endpoints extra. El monolito evita la complejidad de mantener
un backend separado, lo cual es adecuado para el tamaño actual del proyecto.

### 3. Capa de servicios en `lib/services/`

Los componentes y páginas nunca llaman a Supabase directamente. Toda consulta
pasa por una función en `lib/services/`. Ventajas:

- Los tests pueden probar la lógica sin levantar una base de datos real.
- Si Supabase cambia su API, solo hay que tocar un sitio.
- Queda claro dónde vive la lógica de negocio.

### 4. RLS + `service_role` para matrículas

La tabla `enrollments` no tiene políticas de INSERT desde el cliente. Solo el
servidor puede insertar, y solo tras verificar la firma del webhook de Stripe.
Esto garantiza que ningún alumno pueda matricularse sin pagar, aunque acceda
directamente a la API.

### 5. URLs firmadas de Bunny.net para vídeo protegido

Los vídeos no tienen una URL pública permanente. Cada vez que una alumna
matriculada abre el aula, el servidor genera una URL firmada con SHA-256 que
caduca en 4 horas. Si alguien copia la URL, deja de funcionar pasado ese
tiempo. La firma usa `BUNNY_TOKEN_AUTH_KEY`, que nunca sale del servidor.
