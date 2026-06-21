-- ============================================================================
-- Academia Creativa — Datos de ejemplo (seed)
-- ----------------------------------------------------------------------------
-- Cómo usar este archivo:
--   1. Asegúrate de haber ejecutado schema.sql primero (las tablas deben
--      existir antes de insertar datos).
--   2. Abre Supabase → tu proyecto → SQL Editor.
--   3. Pega este script y ejecútalo.
--
-- Este archivo es SOLO para pruebas durante el desarrollo. Antes de lanzar
-- el proyecto en producción, los cursos reales se crearán desde el panel
-- de administración.
-- ============================================================================


-- ============================================================================
-- BLOQUE 1 — Cursos de ejemplo
-- ----------------------------------------------------------------------------
-- Insertamos 3 cursos para poder probar:
--   - El catálogo público (que solo muestra los publicados).
--   - El pago y la matrícula (usando los cursos publicados).
--   - Que el filtro de borradores funciona (el tercero no debe aparecer).
--
-- Recuerda: price_cents guarda el precio en céntimos.
--   14900 = 149,00 €  |  19900 = 199,00 €  |  9900 = 99,00 €
-- ============================================================================

insert into public.courses (title, slug, description, price_cents, currency, status)
values

  -- Curso 1: publicado
  -- Curso de branding completo, de nivel medio-alto, precio competitivo.
  (
    'Branding desde cero: identidad visual que conecta',
    'branding-desde-cero',
    'Aprende a construir marcas con personalidad y coherencia visual. Desde el concepto hasta el manual de marca, pasando por logotipo, paleta de color y tipografía.',
    14900,
    'eur',
    'published'
  ),

  -- Curso 2: publicado
  -- Motion graphics es una de las habilidades más demandadas en diseño digital.
  (
    'Motion Graphics: animación para diseñadores',
    'motion-graphics-animacion',
    'Domina After Effects y da vida a tus diseños. Aprende principios de animación, motion design y exportación de piezas para redes sociales y vídeo.',
    19900,
    'eur',
    'published'
  ),

  -- Curso 3: borrador (draft)
  -- Este curso está en preparación. NO debe aparecer en el catálogo público.
  -- Sirve para verificar que la política RLS de 'courses' filtra correctamente:
  -- cualquier visitante (o alumno) que consulte el catálogo NO debe verlo.
  -- Solo un admin debería verlo en la lista completa.
  (
    'Diseño editorial: publicaciones que se leen',
    'diseno-editorial',
    'Maquetación profesional para revistas, libros y catálogos. Tipografía avanzada, grillas, color y preparación de archivos para imprenta.',
    9900,
    'eur',
    'draft'
  );

-- ============================================================================
-- BLOQUE 2 — Temario de ejemplo: secciones y lecciones
-- ----------------------------------------------------------------------------
-- Añadimos secciones y lecciones para los dos cursos publicados.
-- Los IDs de los cursos son UUIDs generados automáticamente, así que los
-- buscamos por su slug (que es único) usando una subconsulta.
-- El campo video_id se deja vacío (NULL): se rellenará cuando integremos
-- el proveedor de vídeo protegido.
-- Orden obligatorio: primero las secciones, luego las lecciones, porque
-- las lecciones necesitan que las secciones ya existan para apuntarles.
-- ============================================================================


-- ----------------------------------------------------------------
-- Secciones — Branding desde cero (slug: branding-desde-cero)
-- ----------------------------------------------------------------

insert into public.course_sections (course_id, title, position)
values
  (
    (select id from public.courses where slug = 'branding-desde-cero'),
    'Fundamentos del branding',
    1
  ),
  (
    (select id from public.courses where slug = 'branding-desde-cero'),
    'Creación del logotipo',
    2
  ),
  (
    (select id from public.courses where slug = 'branding-desde-cero'),
    'Manual de marca',
    3
  );


-- ----------------------------------------------------------------
-- Secciones — Motion Graphics (slug: motion-graphics-animacion)
-- ----------------------------------------------------------------

insert into public.course_sections (course_id, title, position)
values
  (
    (select id from public.courses where slug = 'motion-graphics-animacion'),
    'Principios de animación',
    1
  ),
  (
    (select id from public.courses where slug = 'motion-graphics-animacion'),
    'After Effects desde cero',
    2
  ),
  (
    (select id from public.courses where slug = 'motion-graphics-animacion'),
    'Proyecto final',
    3
  );


-- ================================================================
-- Lecciones — Branding desde cero
-- ================================================================
-- Para encontrar la sección correcta uso dos condiciones:
--   - que pertenezca al curso con slug 'branding-desde-cero'
--   - que tenga el número de posición correspondiente
-- El SELECT + CROSS JOIN es la forma más limpia de insertar varias
-- lecciones en la misma sección sin repetir la subconsulta de sección.
-- ================================================================

-- Sección 1: Fundamentos del branding
insert into public.lessons (section_id, title, position)
select s.id, l.title, l.position
from public.course_sections s
cross join (values
  ('¿Qué es una marca y por qué importa?', 1),
  ('Los elementos de una identidad visual', 2),
  ('Análisis de marcas referentes',         3)
) as l(title, position)
where s.course_id = (select id from public.courses where slug = 'branding-desde-cero')
  and s.position = 1;

-- Sección 2: Creación del logotipo
insert into public.lessons (section_id, title, position)
select s.id, l.title, l.position
from public.course_sections s
cross join (values
  ('Bocetado y conceptualización',          1),
  ('Construcción vectorial en Illustrator', 2)
) as l(title, position)
where s.course_id = (select id from public.courses where slug = 'branding-desde-cero')
  and s.position = 2;

-- Sección 3: Manual de marca
insert into public.lessons (section_id, title, position)
select s.id, l.title, l.position
from public.course_sections s
cross join (values
  ('Paleta de color y tipografía corporativa',  1),
  ('Usos correctos e incorrectos del logotipo', 2),
  ('Exportación y entrega de archivos',          3)
) as l(title, position)
where s.course_id = (select id from public.courses where slug = 'branding-desde-cero')
  and s.position = 3;


-- ================================================================
-- Lecciones — Motion Graphics: animación para diseñadores
-- ================================================================

-- Sección 1: Principios de animación
insert into public.lessons (section_id, title, position)
select s.id, l.title, l.position
from public.course_sections s
cross join (values
  ('Los 12 principios de la animación aplicados al motion', 1),
  ('Timing y spacing: la base de todo movimiento',          2)
) as l(title, position)
where s.course_id = (select id from public.courses where slug = 'motion-graphics-animacion')
  and s.position = 1;

-- Sección 2: After Effects desde cero
insert into public.lessons (section_id, title, position)
select s.id, l.title, l.position
from public.course_sections s
cross join (values
  ('Interfaz y flujo de trabajo',                      1),
  ('Keyframes, curvas y el gráfico de velocidad',      2),
  ('Expresiones básicas para automatizar animaciones', 3)
) as l(title, position)
where s.course_id = (select id from public.courses where slug = 'motion-graphics-animacion')
  and s.position = 2;

-- Sección 3: Proyecto final
insert into public.lessons (section_id, title, position)
select s.id, l.title, l.position
from public.course_sections s
cross join (values
  ('Animación de un logotipo completo',        1),
  ('Exportación para redes sociales y vídeo', 2)
) as l(title, position)
where s.course_id = (select id from public.courses where slug = 'motion-graphics-animacion')
  and s.position = 3;


-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
