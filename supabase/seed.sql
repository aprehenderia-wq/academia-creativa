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
-- FIN DEL SCRIPT
-- ============================================================================
