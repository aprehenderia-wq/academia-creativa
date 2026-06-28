-- ============================================================================
-- Migración: tabla certificates (certificados de finalización de curso)
-- ----------------------------------------------------------------------------
-- Cómo aplicar:
--   1. Abre Supabase → tu proyecto → SQL Editor.
--   2. Pega TODO este script y ejecútalo.
--
-- Un certificado se emite automáticamente cuando un alumno completa el 100%
-- de las lecciones de un curso. Solo puede existir un certificado por alumno
-- por curso (restricción unique). El código de certificado es un texto único
-- generado en el servidor (formato ACAD-YYYY-XXXXXXXX).
--
-- Por seguridad, la inserción de certificados no está permitida desde el
-- navegador: igual que enrollments, el servidor usa service_role para insertar,
-- tras verificar que todas las lecciones están completadas.
-- ============================================================================

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  certificate_code text not null unique,
  issued_at timestamptz not null default now(),
  -- Un alumno no puede tener dos certificados del mismo curso.
  unique (user_id, course_id)
);

alter table public.certificates enable row level security;

-- LEER: cada alumno ve solo sus propios certificados; un admin ve todos.
-- (No hay políticas de INSERT/UPDATE/DELETE: el servidor usa service_role.)
create policy "certificates_select_own_or_admin"
on public.certificates for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);
