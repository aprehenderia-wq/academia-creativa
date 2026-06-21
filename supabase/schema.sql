-- ============================================================================
-- Academia Creativa — Modelo de datos completo (estructura + seguridad)
-- ----------------------------------------------------------------------------
-- Cómo usar este archivo:
--   1. Abre Supabase → tu proyecto → SQL Editor.
--   2. Pega TODO este script y ejecútalo una sola vez.
--   3. No incluye datos de ejemplo: solo crea las tablas, la función de
--      seguridad y las políticas de acceso (RLS).
--
-- Conceptos clave que se usan aquí:
--   - RLS (Row Level Security / Seguridad a Nivel de Fila): un "portero" que
--     decide, fila por fila, quién puede leer o escribir cada registro. Si una
--     tabla tiene RLS activada y NO tiene políticas que permitan algo, ese algo
--     queda PROHIBIDO por defecto. Es decir: lo que no se permite, se niega.
--   - auth.users: tabla interna de Supabase donde viven los usuarios que
--     inician sesión. Nuestras tablas se "cuelgan" de ahí mediante el id.
--   - auth.uid(): función de Supabase que devuelve el id del usuario que está
--     haciendo la petición en este momento. Para un visitante sin sesión
--     (anónimo) devuelve NULL.
--   - service_role: una clave especial que se usa SOLO en el servidor y que
--     SALTA todas las políticas RLS. La usaremos para matricular tras un pago.
--     Nunca debe estar en el navegador.
-- ============================================================================


-- ============================================================================
-- BLOQUE 0 — Tipos enumerados (listas cerradas de valores)
-- ----------------------------------------------------------------------------
-- Un "enum" es una lista fija de valores permitidos. Así evitamos errores de
-- escritura (por ejemplo 'admni' en vez de 'admin') porque la base de datos
-- solo acepta exactamente los valores que definimos.
-- ============================================================================

-- Roles posibles de un usuario dentro de la plataforma.
create type public.user_role as enum ('student', 'admin');

-- Estado de un curso: borrador (no visible al público) o publicado (visible).
create type public.course_status as enum ('draft', 'published');


-- ============================================================================
-- BLOQUE 1 — profiles (perfil de cada usuario)
-- ----------------------------------------------------------------------------
-- Guarda los datos públicos/visibles de cada persona registrada. Se conecta
-- uno-a-uno con auth.users: cada usuario que se registra tiene un perfil.
-- IMPORTANTE: aquí NO guardamos el rol. El rol va en su propia tabla
-- (user_roles) por seguridad: si el rol viviera aquí y el usuario pudiera
-- editar su propio perfil, podría auto-ascenderse a admin. Separándolo,
-- el usuario edita su perfil pero NUNCA su rol.
-- ============================================================================

create table public.profiles (
  -- El id es el MISMO que el del usuario en auth.users (relación 1 a 1).
  -- on delete cascade: si se borra el usuario, se borra su perfil.
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

-- Activamos RLS desde el primer momento, antes de crear ninguna política.
-- Mientras no haya políticas, la tabla queda totalmente cerrada.
alter table public.profiles enable row level security;


-- ============================================================================
-- BLOQUE 2 — user_roles (rol de cada usuario, separado del perfil)
-- ----------------------------------------------------------------------------
-- Tabla deliberadamente separada de profiles. Solo un admin (o el servidor con
-- service_role) puede escribir aquí. Así, el "ascenso" a admin es una operación
-- privilegiada y controlada, no algo que el propio usuario pueda tocar.
-- ============================================================================

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  -- Evita filas duplicadas del mismo rol para el mismo usuario.
  unique (user_id, role)
);

alter table public.user_roles enable row level security;


-- ============================================================================
-- BLOQUE 3 — Función is_admin() (comprobar si quien pregunta es admin)
-- ----------------------------------------------------------------------------
-- ¿Por qué necesitamos esta función?
--   Las políticas RLS van a preguntar muchas veces "¿este usuario es admin?".
--   Esa respuesta está en user_roles. Pero si una política DE user_roles
--   consultara user_roles, se entraría en un bucle infinito (recursión): para
--   leer la tabla hay que comprobar el rol, y para comprobar el rol hay que
--   leer la tabla... y así sin fin.
--
-- La solución: SECURITY DEFINER.
--   Una función SECURITY DEFINER se ejecuta con los permisos de quien la creó
--   (el dueño de la base de datos), NO con los de quien la llama. Eso hace que,
--   dentro de la función, se salte la RLS y pueda leer user_roles directamente
--   sin disparar el bucle.
--
--   'set search_path = public' fija dónde busca las tablas la función, lo que
--   cierra una vía de ataque conocida (que alguien "engañe" a la función para
--   que use tablas falsas).
--   'stable' indica que, dentro de una misma consulta, la función devuelve
--   siempre lo mismo: ayuda al rendimiento.
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;


-- ============================================================================
-- BLOQUE 4 — courses (cursos del catálogo)
-- ----------------------------------------------------------------------------
-- El catálogo. Cualquiera puede ver los cursos PUBLICADOS; los borradores solo
-- los ve un admin. El precio se guarda en céntimos (un entero) en lugar de con
-- decimales: es la práctica estándar con pagos (Stripe trabaja en céntimos) y
-- evita errores de redondeo. 1990 = 19,90 €.
-- ============================================================================

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  -- slug: versión del título apta para la URL (p. ej. 'diseno-de-logos').
  -- unique: no puede haber dos cursos con el mismo slug.
  slug text not null unique,
  description text,
  price_cents integer not null default 0,
  currency text not null default 'eur',
  status public.course_status not null default 'draft',
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;


-- ============================================================================
-- BLOQUE 5 — course_sections (secciones/módulos de un curso)
-- ----------------------------------------------------------------------------
-- Un curso se divide en secciones ordenadas (Módulo 1, Módulo 2, ...).
-- 'position' guarda el orden en que se muestran.
-- ============================================================================

create table public.course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.course_sections enable row level security;


-- ============================================================================
-- BLOQUE 6 — lessons (lecciones dentro de cada sección)
-- ----------------------------------------------------------------------------
-- Cada lección pertenece a una sección. 'video_id' queda opcional (nullable)
-- porque el vídeo protegido lo conectaremos más adelante; de momento puede
-- estar vacío. El CONTENIDO de las lecciones es lo que protegeremos: solo lo
-- verá quien haya comprado (tenga enrollment de) ese curso, o un admin.
-- ============================================================================

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.course_sections (id) on delete cascade,
  title text not null,
  video_id text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;


-- ============================================================================
-- BLOQUE 7 — enrollments (matrículas: quién compró qué curso)
-- ----------------------------------------------------------------------------
-- Una fila por cada (alumno, curso) que el alumno ha comprado. Es la "llave"
-- que da acceso al contenido de las lecciones. Por seguridad, NADIE podrá
-- insertar aquí desde el navegador: las matrículas solo se crean en el servidor
-- con service_role, tras confirmar el pago. Más abajo verás que, a propósito,
-- NO creamos ninguna política de INSERT para esta tabla.
-- ============================================================================

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  -- Un alumno no puede matricularse dos veces en el mismo curso.
  unique (user_id, course_id)
);

alter table public.enrollments enable row level security;


-- ============================================================================
-- BLOQUE 8 — lesson_progress (progreso: qué lección completó cada alumno)
-- ----------------------------------------------------------------------------
-- Una fila por cada (alumno, lección) completada. Sirve para mostrar la barra
-- de progreso y, más adelante, para decidir si se puede emitir el certificado.
-- ============================================================================

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  -- Una lección se marca como completada una sola vez por alumno.
  unique (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;


-- ============================================================================
-- ============================================================================
-- POLÍTICAS RLS
-- ----------------------------------------------------------------------------
-- A partir de aquí definimos QUIÉN puede hacer QUÉ en cada tabla.
--
-- ¿Por qué todas las políticas van al final, juntas, y no junto a cada tabla?
--   Porque algunas políticas necesitan que YA existan varias tablas. Por
--   ejemplo, la política de 'lessons' consulta 'enrollments' y
--   'course_sections'. Si la escribiéramos antes de crear esas tablas, fallaría.
--   Por eso primero creamos toda la estructura y luego las reglas de acceso.
--
-- Recordatorio: 'using' controla qué filas se pueden LEER/afectar; 'with check'
-- controla qué valores se pueden ESCRIBIR. Las políticas son "permisivas": si
-- al menos una deja pasar la operación, se permite.
-- ============================================================================
-- ============================================================================


-- ----------------------------------------------------------------------------
-- profiles: cada quien ve y edita el suyo; un admin puede ver todos.
-- ----------------------------------------------------------------------------

-- LEER: ves tu propio perfil; si eres admin, ves todos.
create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
);

-- CREAR: al registrarte, puedes crear tu propio perfil (y solo el tuyo).
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

-- ACTUALIZAR: solo puedes modificar tu propio perfil.
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());


-- ----------------------------------------------------------------------------
-- user_roles: cada quien ve su propio rol; solo un admin puede asignar roles.
-- ----------------------------------------------------------------------------
-- Nota de arranque: el PRIMER admin no se puede crear desde aquí (todavía no
-- hay ningún admin). Se crea ejecutando un INSERT en el SQL Editor, que usa
-- service_role y salta la RLS. Eso lo haremos como paso aparte y manual.

-- LEER: ves tu propio rol; un admin ve los de todos.
create policy "user_roles_select_own_or_admin"
on public.user_roles for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

-- CREAR / ACTUALIZAR / BORRAR roles: solo un admin.
create policy "user_roles_insert_admin"
on public.user_roles for insert
to authenticated
with check (public.is_admin());

create policy "user_roles_update_admin"
on public.user_roles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "user_roles_delete_admin"
on public.user_roles for delete
to authenticated
using (public.is_admin());


-- ----------------------------------------------------------------------------
-- courses: lectura pública SOLO de lo publicado; escritura solo admin.
-- ----------------------------------------------------------------------------

-- LEER: cualquiera (incluso sin sesión) ve los cursos publicados.
-- Un admin ve también los borradores. 'anon' = visitante sin sesión.
create policy "courses_select_published_or_admin"
on public.courses for select
to anon, authenticated
using (
  status = 'published'
  or public.is_admin()
);

-- CREAR / ACTUALIZAR / BORRAR cursos: solo un admin.
create policy "courses_insert_admin"
on public.courses for insert
to authenticated
with check (public.is_admin());

create policy "courses_update_admin"
on public.courses for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "courses_delete_admin"
on public.courses for delete
to authenticated
using (public.is_admin());


-- ----------------------------------------------------------------------------
-- course_sections: el índice del curso (títulos de las secciones) es público
-- si el curso está publicado, para que se pueda previsualizar el temario.
-- Escritura solo admin.
-- ----------------------------------------------------------------------------

-- LEER: ves las secciones de un curso publicado; un admin ve todas.
create policy "course_sections_select_published_or_admin"
on public.course_sections for select
to anon, authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.courses c
    where c.id = course_sections.course_id
      and c.status = 'published'
  )
);

-- CREAR / ACTUALIZAR / BORRAR secciones: solo un admin.
create policy "course_sections_insert_admin"
on public.course_sections for insert
to authenticated
with check (public.is_admin());

create policy "course_sections_update_admin"
on public.course_sections for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "course_sections_delete_admin"
on public.course_sections for delete
to authenticated
using (public.is_admin());


-- ----------------------------------------------------------------------------
-- lessons: AQUÍ está la excepción importante. El contenido de las lecciones
-- NO es público aunque el curso esté publicado. Solo lo ve:
--   - un alumno que tenga enrollment (matrícula) del curso al que pertenece
--     la lección, o
--   - un admin.
-- Escritura solo admin.
-- ----------------------------------------------------------------------------

-- LEER: eres admin, O estás matriculado en el curso de esta lección.
-- La consulta sube de la lección -> su sección -> el curso, y comprueba que
-- exista una matrícula tuya para ese curso.
create policy "lessons_select_enrolled_or_admin"
on public.lessons for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.course_sections cs
    join public.enrollments e on e.course_id = cs.course_id
    where cs.id = lessons.section_id
      and e.user_id = auth.uid()
  )
);

-- CREAR / ACTUALIZAR / BORRAR lecciones: solo un admin.
create policy "lessons_insert_admin"
on public.lessons for insert
to authenticated
with check (public.is_admin());

create policy "lessons_update_admin"
on public.lessons for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "lessons_delete_admin"
on public.lessons for delete
to authenticated
using (public.is_admin());


-- ----------------------------------------------------------------------------
-- enrollments: cada alumno ve solo sus matrículas; un admin ve todas.
-- NADIE inserta desde el navegador: las matrículas se crean en el servidor
-- con service_role tras el pago (esa clave salta la RLS). Por eso NO existe
-- ninguna política de INSERT/UPDATE/DELETE aquí: al no haberla, esas
-- operaciones quedan PROHIBIDAS para alumnos y admins desde el cliente.
-- ----------------------------------------------------------------------------

-- LEER: ves tus propias matrículas; un admin ve todas.
create policy "enrollments_select_own_or_admin"
on public.enrollments for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

-- (Intencionadamente NO hay políticas de escritura para enrollments.)


-- ----------------------------------------------------------------------------
-- lesson_progress: cada alumno ve y actualiza solo su progreso; admin ve todo.
-- ----------------------------------------------------------------------------

-- LEER: ves tu propio progreso; un admin ve el de todos.
create policy "lesson_progress_select_own_or_admin"
on public.lesson_progress for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

-- CREAR: marcas como completada una lección, registrándola a tu nombre.
create policy "lesson_progress_insert_own"
on public.lesson_progress for insert
to authenticated
with check (user_id = auth.uid());

-- ACTUALIZAR: solo puedes modificar tu propio progreso.
create policy "lesson_progress_update_own"
on public.lesson_progress for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());


-- ============================================================================
-- FIN DEL SCRIPT
-- ----------------------------------------------------------------------------
-- Resumen de seguridad:
--   - Todas las tablas tienen RLS activada.
--   - El catálogo (courses, course_sections publicados) es visible para todos.
--   - El contenido de las lecciones exige matrícula o ser admin.
--   - Las matrículas solo se crean en el servidor (service_role).
--   - El rol vive separado del perfil: nadie se auto-asciende a admin.
-- ============================================================================
