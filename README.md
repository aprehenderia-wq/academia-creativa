# Academia Creativa

Plataforma web de cursos de diseño digital. Permite explorar un catálogo de
cursos, comprarlos, acceder al contenido en vídeo, seguir el progreso y
descargar certificados de finalización.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · Supabase ·
Stripe · Resend · Bunny.net · Vercel

---

## Entornos

| Entorno | URL | Rama |
|---|---|---|
| **Producción** | https://academia-creativa-one.vercel.app | `main` |
| **Staging** | https://academia-creativa-git-develop-aprehenderia-9285s-projects.vercel.app | `develop` |

Cada push a `develop` actualiza el entorno de staging automáticamente.
Los merges a `main` actualizan producción.

---

## Flujo de trabajo (Git)

```
feature/<nombre>  →  develop  →  main
```

1. Crear rama `feature/nombre` desde `develop`.
2. Desarrollar y probar en local.
3. Merge a `develop` → verificar en staging.
4. Solo cuando está validado → merge a `main` → producción.

Nunca se trabaja directamente sobre `main`.

---

## Arrancar en local

**Requisitos:** Node.js 20+ · cuenta en Supabase, Stripe y Bunny.net · Stripe CLI

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env.local
# Rellenar todos los valores en .env.local

# 3. Inicializar la base de datos
# Supabase → SQL Editor → ejecutar supabase/schema.sql
# Luego ejecutar supabase/migrations/20260628_certificates.sql

# 4. Arrancar el servidor
npm run dev
```

Para probar pagos con Stripe en local:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copiar el whsec_... que imprime y pegarlo en STRIPE_WEBHOOK_SECRET del .env.local
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Tests

```bash
npm test
```

Tests unitarios con Vitest en `__tests__/services/`.

---

## Documentación

La carpeta `docs/` contiene:

| Archivo | Para quién | Qué explica |
|---|---|---|
| [`documentacion-tecnica.md`](docs/documentacion-tecnica.md) | Desarrolladores | Arquitectura, modelo de datos, variables de entorno, cómo arrancar |
| [`guia-uso-laura.md`](docs/guia-uso-laura.md) | Equipo de Academia Creativa | Cómo gestionar cursos, alumnos y resolver problemas desde el panel admin |
| [`entrega-cliente.md`](docs/entrega-cliente.md) | Cliente | Accesos, funcionalidades entregadas, activación del modo producción |

---

## Convenciones del proyecto

- Código y nombres de variables: **inglés**
- Mensajes de commit y comentarios para el equipo: **español**
- Texto visible para el usuario final: **español**
- Tablas de Supabase: todas con **RLS activada**
- Operaciones privilegiadas (matrículas): solo desde el servidor con `service_role`
- Variables de entorno: nunca en Git — solo en `.env.local` o en Vercel

---

## Seguridad

- `.env.local` está en `.gitignore` y nunca se sube al repositorio.
- Todas las tablas de Supabase tienen Row Level Security (RLS) activada.
- Las matrículas solo se crean en el servidor, tras verificar el pago de Stripe.
- Los vídeos de los cursos usan URLs firmadas que caducan en 4 horas.
- Los certificados solo los emite el servidor con `service_role`.
