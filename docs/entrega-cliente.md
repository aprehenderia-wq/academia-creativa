# Documento de Entrega — Academia Creativa

> Entregado a: Laura Jiménez / Sara (Academia Creativa)
> Fecha de entrega: junio 2026
> Preparado por: aprehenderia-wq (Amelia Jiménez)

---

## 1. Accesos del proyecto

### URLs de la plataforma

| Entorno | URL | Rama de Git |
|---|---|---|
| **Producción** | https://academia-creativa-one.vercel.app | `main` |
| **Staging (pruebas)** | https://academia-creativa-git-develop-aprehenderia-9285s-projects.vercel.app | `develop` |

La URL de staging refleja siempre el último estado en desarrollo. La de
producción solo se actualiza cuando se hace un merge a `main` — es la que
ven las alumnas reales.

### Panel de administración

- URL: `https://academia-creativa-one.vercel.app/admin`
- Acceso: iniciar sesión con una cuenta que tenga rol `admin` en la base de datos.

### Servicios externos

| Servicio | Para qué | Dónde gestionar |
|---|---|---|
| **Supabase** | Base de datos y autenticación | app.supabase.com |
| **Stripe** | Cobros y pagos | dashboard.stripe.com |
| **Resend** | Envío de emails | resend.com |
| **Bunny.net** | Alojamiento y streaming de vídeos | dash.bunny.net |
| **Vercel** | Hosting y despliegue automático | vercel.com |
| **GitHub** | Repositorio del código fuente | github.com |

> Las credenciales de cada servicio las gestiona el cliente directamente.
> El equipo de desarrollo nunca las almacena.

---

## 2. Funcionalidades entregadas

### Para las alumnas

| Funcionalidad | Estado |
|---|:---:|
| Catálogo de cursos (página pública) | ✅ |
| Página de detalle de cada curso con temario | ✅ |
| Imagen hero y portadas de cursos | ✅ |
| Registro e inicio de sesión | ✅ |
| Dashboard personal con cursos comprados y barra de progreso | ✅ |
| Compra de cursos con Stripe (checkout completo) | ✅ |
| Páginas de confirmación y cancelación de pago | ✅ |
| Acceso al aula con reproductor de vídeo protegido | ✅ |
| Seguimiento de progreso por lección | ✅ |
| Certificado PDF descargable al completar el curso | ✅ |
| Email de bienvenida al registrarse | ✅ |
| Email de confirmación de compra | ✅ |
| Diseño responsive para móvil y escritorio | ✅ |
| Menú hamburguesa para móvil | ✅ |
| Paleta de colores diversificada por categoría | ✅ |

### Para las administradoras

| Funcionalidad | Estado |
|---|:---:|
| Panel admin con métricas (cursos, alumnos, matrículas) | ✅ |
| Listado de alumnos con sus cursos y última matrícula | ✅ |
| Listado de transacciones (últimas 100 compras) | ✅ |
| Formulario completo para crear cursos nuevos | ✅ |
| Emails automáticos a alumnas inactivas (14+ días) | ✅ |

### Calidad técnica

| Mejora técnica | Estado |
|---|:---:|
| Gestión segura de secretos (.env.example + .gitignore) | ✅ |
| Vídeo protegido con URLs firmadas (caducan en 4 horas) | ✅ |
| Certificados PDF con código de verificación único | ✅ |
| Suite de 33 tests automáticos con Vitest | ✅ |

---

## 3. Fuera del alcance de esta entrega (Fase 2)

Las siguientes funcionalidades quedan pendientes para una fase posterior:

| Funcionalidad | Prioridad sugerida |
|---|:---:|
| Edición y eliminación de cursos desde el panel admin | Alta |
| Gestión de secciones y lecciones desde interfaz web (sin Supabase) | Alta |
| Subida de vídeos a Bunny.net desde el panel admin | Media |
| Sistema de cupones de descuento | Media |
| Suscripciones mensuales o anuales | Media |
| Valoraciones y reseñas de cursos | Media |
| Perfil editable para la alumna | Media |
| Notificaciones por email cuando se publican cursos nuevos | Baja |
| App móvil nativa | Baja |
| Panel de analíticas avanzado (embudo de conversión, retención) | Baja |

---

## 4. Tres mejoras técnicas documentadas

Estas tres mejoras justifican el nivel de calidad técnica del proyecto más
allá de un MVP básico. El detalle completo (problema, prompt, resultado) está
en [`docs/mejoras-claude-code.md`](mejoras-claude-code.md).

### Mejora 1: Gestión segura de secretos

Todas las claves API viven en variables de entorno y están excluidas de Git.
Las variables públicas (`NEXT_PUBLIC_*`) pueden ir al navegador; las secretas
solo existen en el servidor. Ninguna credencial puede filtrarse al repositorio.

### Mejora 2: Vídeo protegido con URLs firmadas

Los vídeos no tienen URL pública. Cada vez que una alumna matriculada abre el
aula, el servidor genera una URL firmada con SHA-256 que caduca en 4 horas.
La verificación de matrícula la hace la propia base de datos (RLS de Supabase)
antes de generar la firma.

### Mejora 3: Certificados PDF con código verificable

Al completar el 100% de las lecciones, el sistema emite automáticamente un
certificado PDF con nombre de la alumna, título del curso, fecha de emisión y
un código único (`ACAD-2026-XXXXXXXX`). Se genera en el servidor con `pdf-lib`
y es descargable desde el dashboard en cualquier momento.

---

## 5. Checklist para pasar Stripe de modo test a modo real

Completar estos pasos en orden cuando la plataforma esté lista para cobrar:

### En Stripe

- [ ] Ir a [dashboard.stripe.com](https://dashboard.stripe.com) → cambiar el
  selector de **Test mode** a **Live mode** (arriba a la derecha).
- [ ] En **Products → Add product**: crear un producto por cada curso con su
  precio en euros.
- [ ] Anotar el `price_xxx` (ID del precio) de cada producto.
- [ ] En **Developers → API keys**: copiar la **Secret key** (`sk_live_…`) y
  la **Publishable key** (`pk_live_…`).
- [ ] En Vercel → Settings → Environment Variables: actualizar
  `STRIPE_SECRET_KEY` y `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` con las claves live.
- [ ] En **Developers → Webhooks → Add endpoint**:
  - URL: `https://academia-creativa-one.vercel.app/api/webhooks/stripe`
  - Evento: `checkout.session.completed`
  - Copiar el secreto `whsec_…` generado.
- [ ] En Vercel: actualizar `STRIPE_WEBHOOK_SECRET` con el `whsec_…` de live.

### En Supabase

- [ ] En la tabla `courses`, actualizar la columna `stripe_price_id` de cada
  curso con el `price_xxx` del modo live correspondiente (sin esto, el botón
  de compra no funcionará).

### En Resend

- [ ] En [resend.com](https://resend.com) → **Domains**: verificar el dominio
  de email propio (ej: `tudominio.com`).
- [ ] En Vercel: añadir `RESEND_FROM_EMAIL` con el email verificado
  (ej: `Academia Creativa <hola@tudominio.com>`).

### Verificación final

- [ ] Hacer una compra de prueba real (importe pequeño) en producción.
- [ ] Confirmar que llega el email de confirmación.
- [ ] Confirmar que la matrícula aparece en el panel admin → Transacciones.
- [ ] Confirmar que la alumna tiene acceso al aula.

---

## 6. Plan de mantenimiento

### Revisiones periódicas

| Tarea | Frecuencia | Herramienta |
|---|---|---|
| Revisar pagos y posibles disputas | Semanal | Stripe → Payments |
| Revisar emails enviados (entregas, rebotes) | Mensual | Resend → Logs |
| Revisar logs de errores del servidor | Mensual | Vercel → Logs |
| Hacer copia de seguridad manual de la BD | Mensual | Supabase → Backups |
| Revisar uso de almacenamiento de vídeo | Trimestral | Bunny.net → Statistics |
| Actualizar dependencias del proyecto | Trimestral | `npm audit` + `npm update` |
| Revisar vencimiento de dominio y SSL | Anual | Registrador de dominio / Vercel |

### Supabase

- Las copias de seguridad automáticas están activadas en el plan gratuito
  (retención de 7 días). Para más retención, considerar un plan de pago.
- No borrar usuarios desde **Authentication → Users** sin consultarlo:
  borra en cascada perfiles, matrículas y certificados.

### Stripe

- Revisar mensualmente que no haya disputas (chargebacks) sin resolver.
- Si se añaden cursos nuevos, crear el producto y precio en Stripe y luego
  actualizar `stripe_price_id` en Supabase.

### Resend

- Si los emails empiezan a caer en spam, revisar la configuración de DKIM/SPF
  del dominio en Resend → Domains.
- El plan gratuito de Resend permite 3.000 emails/mes. Si se supera, subir
  de plan.

### Bunny.net

- Los vídeos se almacenan en Bunny.net y generan ancho de banda al reproducirse.
- Revisar el uso mensual en Bunny.net → Statistics para anticipar costes.
- Si se sube un vídeo nuevo a Bunny.net, añadir su `video_id` en la columna
  correspondiente de la tabla `lessons` en Supabase.

### Vercel

- El despliegue es automático: cada push a `main` actualiza producción.
- Si una actualización rompe algo, Vercel permite hacer rollback a cualquier
  despliegue anterior desde el dashboard (Deployments → seleccionar versión →
  Promote to Production).

### Envío de recordatorios de inactividad

El endpoint `POST /api/admin/send-reminders` detecta alumnas que llevan más
de 14 días sin completar ninguna lección y les envía un email motivacional.
Para activarlo, hacer una petición con la cabecera:

```
Authorization: Bearer <valor de ADMIN_API_KEY>
```

Se puede automatizar con un cron job externo (EasyCron, GitHub Actions
scheduled workflows, etc.) o ejecutarlo manualmente con Postman o Insomnia.
