# CLAUDE.md — Academia Creativa

## Qué es este proyecto
Plataforma web de cursos de diseño (Academia Creativa). Permite ver un
catálogo de cursos, comprarlos, acceder al contenido, seguir el progreso
y emitir certificados. Este es el producto real, construido desde cero.
Existió un prototipo en Lovable que sirvió solo como referencia visual y
de alcance; su código NO es la base de este proyecto.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS — arquitectura monolito
  (frontend y backend en el mismo proyecto).
- Supabase — base de datos (Postgres), autenticación y storage.
- Stripe — pagos (modo test durante el desarrollo).
- Resend — emails transaccionales.
- Despliegue en Vercel. Repositorio en GitHub.

## Con quién trabajas
Soy nueva en programación; este es mi primer proyecto con Claude Code.
Trabajo en Windows, en sesiones cortas. Necesito:
- Explicaciones en lenguaje sencillo; define los términos técnicos la
  primera vez que los uses.
- El "porqué" antes del "cómo".
- Avísame claramente cuándo me toca hacer algo manual (crear cuentas,
  pegar credenciales, hacer merges).

## Cómo comportarte
- Ejecuta tareas pequeñas y mecánicas por tu cuenta, pero PIDE permiso y
  explícame antes de cambios grandes o decisiones de arquitectura.
- Explícame qué hiciste sobre la marcha, no solo el resultado.
- Si algo no está claro o falta un dato, pregúntame en vez de suponer.

## Convenciones de código
- Nombres en el código (variables, funciones, ramas, tablas) en INGLÉS.
- Mensajes de commit y comentarios para mí, en ESPAÑOL.
- Texto visible para el usuario final, en ESPAÑOL.
- Commits pequeños y frecuentes, con mensajes claros de qué cambió.

## Flujo de ramas (Git)
- `main` = producción. Nunca se trabaja directamente sobre ella.
- `develop` = integración / staging. Aquí se junta y prueba el trabajo.
- `feature/<nombre>` = una rama por funcionalidad, creada DESDE `develop`.
- Flujo: feature → merge a develop → (cuando es estable) merge a main.

## Seguridad (reglas que no se rompen)
- Los archivos de entorno (`.env`, `.env.local`) NUNCA se suben a GitHub;
  van siempre en `.gitignore`.
- Toda tabla de Supabase lleva RLS (Row Level Security) activada desde su
  creación.
- Las operaciones con privilegios (matricular tras un pago) se hacen solo
  desde el servidor con la clave service_role, nunca desde el navegador.

## Alcance actual
El objetivo es el reto: entorno profesional + compra con Stripe (modo test)
+ emails con Resend + un catálogo mínimo + tres mejoras documentadas
(gestión de secretos, video protegido, certificados). El panel de
administración completo y el resto del MVP quedan fuera por ahora.
