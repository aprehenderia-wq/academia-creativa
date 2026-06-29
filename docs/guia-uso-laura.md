# Guía de uso — Academia Creativa

> Para Laura y Sara. Sin términos técnicos. Aquí aprenderás a gestionar
> cursos, ver alumnos y resolver los problemas más habituales.

---

## Antes de empezar: cómo entrar al panel de administración

1. Ve a la web de Academia Creativa.
2. Inicia sesión con tu cuenta de administradora.
3. En la barra de navegación superior aparecerá el enlace **Admin**. Haz clic.
4. Ya estás en el panel. Si no ves el enlace Admin, escríbenos — puede que
   tu cuenta necesite permisos.

La dirección directa del panel es: `/admin`

---

## Qué puedes ver en el panel admin

El panel tiene cuatro secciones, accesibles desde el menú lateral:

| Sección | Qué muestra |
|---|---|
| **Dashboard** | Tres números: cursos publicados, alumnos registrados y matrículas activas |
| **Cursos** | La lista de todos tus cursos con precio, estado y número de matriculadas |
| **Alumnos** | Lista de todas las personas registradas, con los cursos que tienen |
| **Transacciones** | Las últimas 100 compras realizadas (quién compró qué y cuándo) |

---

## Cómo crear un curso nuevo

1. En el menú lateral, haz clic en **Cursos**.
2. Haz clic en el botón **+ Nuevo curso** (arriba a la derecha).
3. Rellena el formulario. Estos son los campos:

| Campo | Obligatorio | Qué poner |
|---|:---:|---|
| **Título** | Sí | El nombre del curso tal como lo verán las alumnas. Ej: `Branding desde cero` |
| **Slug** | Sí | La dirección web del curso. Se genera automáticamente desde el título, pero puedes editarlo. Solo letras minúsculas, números y guiones. Ej: `branding-desde-cero` |
| **Descripción corta** | Sí | 1-2 frases que aparecen en la tarjeta del catálogo |
| **Descripción larga** | No | Texto más extenso para la página de detalle del curso |
| **Precio (en euros)** | Sí | El precio que pagarán las alumnas. Pon `0` si es gratis |
| **Categoría** | No | Branding, Ilustración, Motion Graphics… |
| **Nivel** | No | Básico, Intermedio o Avanzado |
| **Instructora** | No | Nombre de quien imparte el curso |
| **Estado** | Sí | `Borrador` = solo tú lo ves. `Publicado` = aparece en el catálogo |

4. Haz clic en **Crear curso**.
5. El curso aparecerá en la lista de Cursos.

> **¿Qué es el slug?**
> Es la parte de la dirección web que identifica al curso. Por ejemplo, si el
> slug es `branding-desde-cero`, la página del curso tendrá esta dirección:
> `academia-creativa-one.vercel.app/courses/branding-desde-cero`.
> Debe ser único (no puede haber dos cursos con el mismo slug) y no puede
> contener mayúsculas, tildes ni espacios.

> **Importante sobre el precio:** si el curso tiene precio, el ID del producto
> en Stripe (`stripe_price_id`) hay que añadirlo directamente desde Supabase
> (ver sección más abajo). Sin ese dato, el botón de compra no funcionará.

---

## Cómo añadir secciones y lecciones a un curso

Las secciones y lecciones se añaden directamente desde **Supabase Table Editor**,
sin necesidad de código. Sigue estos pasos:

### Paso 1: Abre Supabase

Ve a [app.supabase.com](https://app.supabase.com) → tu proyecto → en el menú
de la izquierda, haz clic en **Table Editor**.

### Paso 2: Añade una sección

1. En la lista de tablas, haz clic en **course_sections**.
2. Haz clic en **Insert row** (o el botón de añadir fila, arriba a la derecha).
3. Rellena estos campos:
   - **course_id**: el ID del curso. Lo encuentras en la tabla `courses`,
     columna `id` (parece algo así: `a1b2c3d4-...`).
   - **title**: nombre de la sección. Ej: `Módulo 1 — Fundamentos`.
   - **position**: el número de orden. La primera sección es `0`, la segunda
     `1`, la tercera `2`…
4. Haz clic en **Save**.

### Paso 3: Añade lecciones a esa sección

1. En la lista de tablas, haz clic en **lessons**.
2. Haz clic en **Insert row**.
3. Rellena estos campos:
   - **section_id**: el ID de la sección que acabas de crear. Lo encuentras
     en la tabla `course_sections`, columna `id`.
   - **title**: nombre de la lección. Ej: `¿Qué es el branding?`.
   - **video_id**: el ID del vídeo en Bunny.net (opcional — si el vídeo aún
     no está subido, puedes dejarlo vacío).
   - **position**: el orden dentro de la sección (`0`, `1`, `2`…).
4. Haz clic en **Save**.

Repite para cada lección que necesites añadir.

---

## Cómo ver quién compró qué

### Desde el panel admin

1. Ve al panel → **Transacciones**.
2. Verás una tabla con: nombre de la alumna, curso comprado, fecha y precio pagado.
3. La lista muestra las últimas 100 compras, de la más reciente a la más antigua.

### Desde Supabase

Para búsquedas más detalladas:

1. Abre **Supabase → Table Editor → enrollments**.
2. Verás todas las matrículas con su `user_id`, `course_id` y `enrolled_at` (fecha).
3. Si necesitas buscar por nombre o email, abre la tabla **profiles** y filtra
   por `full_name` o `email`.

---

## Cómo buscar a una alumna y resolver problemas de acceso

### Buscar a una alumna

1. **Supabase → Table Editor → profiles**.
2. Usa el buscador de la tabla para filtrar por `full_name` o `email`.
3. Anota el valor de la columna `id` — lo necesitarás para los pasos siguientes.

### Comprobar sus matrículas

1. Ve a **enrollments**.
2. Filtra por `user_id` (pega el ID que anotaste).
3. Verás todos los cursos a los que tiene acceso.

### ¿No puede entrar a un curso que pagó?

Lo más habitual es que la matrícula no se creó (por ejemplo, si hubo un
problema con el webhook de Stripe). La solución es darle acceso manual
(ver sección siguiente).

---

## Cómo dar acceso manual a un curso

Si una alumna pagó pero no tiene acceso, puedes matricularla manualmente:

1. Abre **Supabase → Table Editor → enrollments**.
2. Haz clic en **Insert row**.
3. Rellena:
   - **user_id**: el ID de la alumna (de la tabla `profiles`).
   - **course_id**: el ID del curso (de la tabla `courses`).
4. Haz clic en **Save**.

La alumna tendrá acceso de inmediato la próxima vez que entre a la plataforma.

---

## Cómo revisar los ingresos

Los ingresos se gestionan desde **Stripe Dashboard**:

1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com).
2. En el menú, haz clic en **Payments** (o **Pagos**).
3. Verás todas las transacciones con estado (completada, reembolsada, etc.)
   y el importe de cada una.
4. En **Reports** puedes exportar los datos a Excel si los necesitas.

> Durante el desarrollo, el modo test de Stripe usa tarjetas de prueba y
> el dinero no es real. Cuando la plataforma pase a producción, se activa
> el modo live y ahí sí aparecen los cobros reales.

---

## Qué NO tocar

Estas acciones pueden romper la plataforma o perder datos de forma irreversible:

- **No borres filas de `auth.users`** (la sección de Authentication en Supabase).
  Si necesitas dar de baja a una alumna, consúltanos primero.

- **No modifiques la estructura de las tablas** (añadir/borrar columnas, cambiar
  tipos de datos). Eso solo lo hace el equipo técnico.

- **No cambies las políticas RLS** (en Supabase → Authentication → Policies).
  Son las reglas de seguridad de la base de datos. Modificarlas sin saber lo
  que haces puede dejar datos expuestos o bloquear el acceso a todas las alumnas.

- **No borres cursos con matrículas activas.** Si necesitas retirar un curso
  del catálogo, cámbialo a estado `Borrador` en vez de borrarlo.

Si tienes dudas sobre algo que no aparece aquí, escríbenos antes de hacer cambios.
