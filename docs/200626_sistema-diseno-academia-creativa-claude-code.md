200626

# Sistema de diseño — Academia Creativa

> Referencia para Claude Code. Contiene todas las decisiones de diseño tomadas para la web app de Academia Creativa.
> **Stack destino:** Next.js (App Router) + Tailwind CSS + shadcn/ui + Supabase + Stripe + Resend.
> **Dirección visual:** Editorial cálido · Light mode (no dark mode) · Referencia principal: ETIC_Algarve.
> **Tipografía:** Fraunces (titulares) + Inter (cuerpo/UI).

---

## 1. Paleta de colores

### 1.1 Tokens semánticos

| Rol | Variable CSS | HEX | Uso |
|---|---|---|---|
| Fondo de página | `--background` | `#FBF6F0` | Fondo general crema de toda la app |
| Superficie / tarjetas | `--card` | `#FFFFFF` | Tarjetas, paneles, modales, inputs |
| Texto principal | `--foreground` | `#2C2C2A` | Texto de cuerpo, titulares |
| Texto secundario | `--muted-foreground` | `#5F5E5A` | Metadatos, placeholders, texto de apoyo |
| Marca (display) | `--primary` | `#D85A30` | Acentos, badges, iconos, elementos decorativos grandes |
| Marca (botón) | `--primary-button` | `#C44D26` | Fondo de botones con texto blanco (accesible AA) |
| Marca (texto/hover) | `--primary-strong` | `#993C1D` | Texto en color de marca, enlaces, hover de botón |
| Acento | `--accent` | `#0F6E56` | Éxito, confirmaciones, etiquetas secundarias |
| Borde | `--border` | `#D3D1C7` | Bordes de tarjetas, separadores, inputs |

### 1.2 Rampa terracota (para estados y variaciones)

| Stop | HEX | Uso |
|---|---|---|
| 50 | `#FAECE7` | Fondo suave de badge, chip, hover suave |
| 100 | `#F5C4B3` | Fondo de etiqueta, tag |
| 400 | `#D85A30` | Marca viva (display, acentos) |
| 600 | `#C44D26` | Botón primario (texto blanco) |
| 700 | `#993C1D` | Texto de marca, hover, enlaces |
| 900 | `#4A1B0C` | Texto sobre fondos terracota claros |

### 1.3 Colores por categoría de curso (portadas tipográficas provisionales)

| Categoría | HEX | Verificado |
|---|---|---|
| Diseño gráfico | `#C44D26` | Blanco AA (4.73:1) |
| Branding | `#0F6E56` | Blanco AA (6.20:1) |
| Ilustración | `#9A5F0F` | Blanco AA (5.23:1) — ocre ajustado del original `#BA7517` que fallaba |
| Motion graphics | `#534AB7` | Blanco AA (6.93:1) |

Etiquetas pequeñas de categoría sobre estos fondos: siempre en **blanco puro** (`#FFFFFF`), no tonos claros.

### 1.4 Estados semánticos

| Estado | Fondo | Texto | Nota |
|---|---|---|---|
| Éxito | `#D6EDE7` (verde claro) | `#0F6E56` | Derivado del acento verde |
| Error | No se definió un token específico | — | Usar la rampa roja estándar de shadcn o definir uno. **Pendiente.** |
| Warning | No se definió | — | **Pendiente.** |
| Info | No se definió | — | **Pendiente.** |

> Los estados de error/warning/info no se diseñaron explícitamente. Se recomienda usar los defaults de shadcn/ui (`--destructive`, etc.) y ajustar al tono cálido si desentona. Esto queda por decidir al implementar.

### 1.5 Contrastes WCAG 2.1 verificados (cálculo real, no estimados)

| Par texto / fondo | Ratio | Resultado |
|---|---|---|
| `#2C2C2A` (texto) sobre `#FBF6F0` (crema) | 13.02:1 | **AAA** |
| `#2C2C2A` (texto) sobre `#FFFFFF` (blanco) | 13.99:1 | **AAA** |
| `#5F5E5A` (secundario) sobre `#FBF6F0` (crema) | 6.04:1 | **AA** |
| `#5F5E5A` (secundario) sobre `#FFFFFF` (blanco) | 6.49:1 | **AA** |
| `#993C1D` (marca texto) sobre `#FBF6F0` (crema) | 6.47:1 | **AA** |
| `#993C1D` (marca texto) sobre `#FFFFFF` (blanco) | 6.96:1 | **AA** |
| `#FFFFFF` (blanco) sobre `#C44D26` (botón) | 4.73:1 | **AA** |
| `#0F6E56` (acento) sobre `#FBF6F0` (crema) | 5.77:1 | **AA** |
| `#FFFFFF` (blanco) sobre `#0F6E56` (acento) | 6.20:1 | **AA** |
| `#D85A30` (marca viva) sobre `#FBF6F0` (crema) | 3.60:1 | **AA solo para texto grande (≥18px bold o ≥24px)** |

**Regla del color de marca vivo (`#D85A30`):** usar solo para elementos grandes, decorativos, iconos o badges con su propio texto oscuro. **Nunca** como texto pequeño sobre fondo claro, ni como fondo de botón con texto blanco pequeño (ahí va `#C44D26`).

---

## 2. Tipografía

### 2.1 Familias

| Familia | Tipo | Fuente | Uso |
|---|---|---|---|
| **Fraunces** | Serif display (variable, opsz 9–144) | Google Fonts | Titulares, nombres de curso, precios destacados, métricas, heroes |
| **Inter** | Sans-serif | Google Fonts | Cuerpo, botones, inputs, navegación, metadatos, formularios, tablas |

**Regla:** Fraunces solo en titulares y momentos editoriales. Todo lo funcional (botones, inputs, menús, labels) va en Inter. Sentence case siempre (nunca Title Case ni MAYÚSCULAS sostenidas).

### 2.2 Import (para `app/layout.tsx`)

```tsx
import { Fraunces, Inter } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// En el <body>:
// className={`${inter.variable} ${fraunces.variable} font-sans`}
```

### 2.3 Escala tipográfica (mobile-first)

| Token | Tamaño base (móvil) | Tamaño desktop | Fuente / peso | line-height | Uso |
|---|---|---|---|---|---|
| `display` | 2.25rem (36px) | 3.5rem (56px) | Fraunces 600 | 1.1 | Hero principal |
| `h1` | 1.875rem (30px) | 2.5rem (40px) | Fraunces 600 | 1.15 | Título de página |
| `h2` | 1.5rem (24px) | 1.875rem (30px) | Fraunces 500 | 1.2 | Título de sección |
| `h3` | 1.25rem (20px) | 1.25rem (20px) | Fraunces 500 | 1.3 | Nombre de curso en tarjeta |
| `body` | 1rem (16px) | 1rem (16px) | Inter 400 | 1.7 | Texto general |
| `small` | 0.875rem (14px) | 0.875rem (14px) | Inter 400 | 1.5 | Metadatos, instructor, fechas |
| `caption` | 0.75rem (12px) | 0.75rem (12px) | Inter 500 | 1.4 | Badges, etiquetas, labels |

Usar `rem` (no `px` fijos) para respetar las preferencias del usuario.

---

## 3. Espaciado, radios y sombras

### 3.1 Escala de espaciado (base 4px)

```
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 px
→ en rem: 0.25 · 0.5 · 0.75 · 1 · 1.5 · 2 · 3 · 4 rem
```

Usar esta escala siempre; no inventar valores sueltos. Ritmo vertical entre secciones en `rem`; gaps internos de componentes en `px`.

### 3.2 Radios de esquina

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 6px | Badges, chips, inputs |
| `radius-md` / `--radius` | 8px | Botones, campos de formulario |
| `radius-lg` | 12px | Tarjetas de curso, paneles, modales |
| `radius-xl` | 16px | Contenedores destacados, hero cards |

shadcn/ui usa la variable `--radius` como base (default 0.5rem = 8px). Se ajusta en `globals.css`.

### 3.3 Bordes

- Grosor: `1px` (o `0.5px` en pantallas retina para un aire más fino).
- Color por defecto: `--border` = `#D3D1C7`.
- No usar esquinas redondeadas con bordes de un solo lado (`border-left` decorativo); solo con bordes completos.

### 3.4 Sombras

No se definió un sistema de sombras explícito durante el diseño. El estilo editorial cálido tiende a flat sin sombras. Se recomienda:
- **Sombra sutil para tarjetas elevadas** (hover, modales): `0 1px 3px rgba(0,0,0,0.06)` — solo si se necesita diferenciar elevación.
- **Sin sombras** en el estado normal de tarjetas y botones.

**Pendiente:** definir si se usa sombra en hover de tarjetas de curso o se confía solo en cambio de borde/fondo.

---

## 4. Componentes

### 4.1 Botón primario

- Fondo: `#C44D26` (no `#D85A30` — por accesibilidad).
- Texto: blanco (`#FFFFFF`), Inter 500.
- Radio: `radius-md` (8px).
- Padding: `12px` vertical / `24px` horizontal (móvil puede reducir a `10px`/`20px`).
- Hover: fondo oscurece a `#993C1D`.
- Disabled: opacidad reducida (~50%), sin cursor pointer.
- Loading: deshabilitado + spinner (Loader2 de lucide-react con `animate-spin`) dentro del botón junto al texto.
- Texto: empieza con verbo ("Ver curso", "Comprar ahora", "Empezar", "Registrarse").

### 4.2 Botón secundario

- Fondo: transparente o blanco.
- Borde: `1px solid #D3D1C7`.
- Texto: `#2C2C2A`, Inter 500.
- Hover: fondo crema `#FBF6F0`.

### 4.3 Tarjeta de curso

- Fondo: blanco (`#FFFFFF`).
- Borde: `1px solid #D3D1C7`.
- Radio: `radius-lg` (12px).
- **Estructura de arriba a abajo:**
  1. **Portada** (zona de imagen/color) a sangre arriba, con `width` y `height` definidos (evitar CLS). Esquinas superiores redondeadas igualando la tarjeta.
  2. **Badge de categoría**: fondo `#FAECE7`, texto `#993C1D`, `caption` (12px, Inter 500).
  3. **Nombre del curso**: Fraunces 500, `h3` (20px).
  4. **Instructor + metadatos**: Inter 400, `small` (14px), color `#5F5E5A`.
  5. **Precio**: Fraunces 600, tamaño `h3` o mayor.
  6. **Botón primario** "Ver curso".

### 4.4 Portadas tipográficas provisionales

Mientras no haya imágenes reales, las portadas son **CSS puro** (sin imágenes externas):
- Fondo de color sólido según la categoría del curso (ver tabla en sección 1.3).
- Nombre del curso: Fraunces 600, color blanco, tamaño grande, alineado abajo a la izquierda.
- Etiqueta de categoría: Inter, `caption`, mayúsculas con letter-spacing, color blanco puro (`#FFFFFF`), arriba.
- Proporción: aproximadamente `aspect-ratio: 16/10`.
- Padding interno: ~20px.
- Cuando lleguen portadas reales, solo se sustituye el fondo de color por un `<img>` con `object-cover`, sin tocar el layout.

### 4.5 Patrón de catálogo (inspiración ETIC)

Combina **dos formatos** en vez de una rejilla uniforme de tarjetas idénticas:
1. **Cursos destacados** → tarjetas grandes con portada (imagen o color).
2. **Resto del catálogo** → lista tipográfica: nombre del curso grande en Fraunces + tags de categoría + enlace "Ver curso →". Menos ruido visual, más aire.

Esta combinación no está implementada en el prototipo anterior; es una decisión nueva del sistema de diseño.

### 4.6 Métricas / prueba social

Bloque con cifras grandes en Fraunces (ej. "2.4k alumnos", "4.9 valoración") sobre fondo terracota suave (`#FAECE7`) o crema. Etiqueta pequeña en Inter debajo de cada cifra.

### 4.7 Inputs

- Altura cómoda: ~44px en móvil (para el dedo).
- Borde: `1px solid #D3D1C7`.
- Radio: `radius-md` (8px).
- Fondo: blanco.
- Label visible encima del campo (no solo placeholder).
- Foco: anillo visible (no quitar el outline). Usar el foco estándar de shadcn.
- Error: borde rojo + mensaje específico debajo del campo (no un genérico arriba).

### 4.8 Navegación

- Barra superior: logo a la izquierda, enlaces en Inter, botón primario de acción a la derecha.
- En móvil: colapsar a menú hamburguesa.
- Estado activo del enlace marcado (color terracota o subrayado).

### 4.9 Estados (obligatorios en cada pantalla con datos)

**Empty state:** icono simple + mensaje de una línea, cálido + CTA primario.
- Ejemplo panel sin cursos: "Aún no tienes cursos. Explora el catálogo y empieza tu primer curso." + botón "Ver cursos".
- Mismo patrón para: sin certificados, sin lecciones completadas, búsqueda sin resultados.

**Loading state:** skeletons con la forma del contenido que va a aparecer (no pantalla en blanco ni spinners genéricos).
- Botones que disparan acción (comprar, guardar): deshabilitar + spinner dentro del botón.

**Error state:** copy amable y accionable, nunca el error técnico crudo.
- Incluir botón "Reintentar" cuando aplique.
- Errores de formulario debajo del campo, no como banner genérico.

### 4.10 Sección de proyectos de alumnos (recomendada, no implementada aún)

Galería de trabajos reales de alumnos por curso (imágenes / vídeos). En una academia de diseño, el trabajo de los alumnos es la mejor prueba de competencia. "Dejar que el trabajo hable." Recomendada para futuras iteraciones; no estaba en el prototipo original.

---

## 5. Variables CSS y configuración

### 5.1 Variables CSS para `globals.css` (formato shadcn/ui)

shadcn/ui espera variables CSS en el `:root`. Aquí están en HSL (el formato estándar de shadcn). Si tu versión de shadcn usa OKLCH (Tailwind v4), convierte estos valores.

```css
@layer base {
  :root {
    /* Fondos */
    --background: 33 58% 96%;       /* #FBF6F0 crema */
    --card: 0 0% 100%;              /* #FFFFFF blanco */
    --popover: 0 0% 100%;
    --muted: 40 10% 93%;            /* derivado para fondos muted */

    /* Texto */
    --foreground: 60 2% 17%;        /* #2C2C2A carbón */
    --card-foreground: 60 2% 17%;
    --popover-foreground: 60 2% 17%;
    --muted-foreground: 48 3% 36%;  /* #5F5E5A gris */

    /* Marca */
    --primary: 15 68% 52%;          /* #D85A30 terracota display */
    --primary-foreground: 33 58% 96%; /* texto sobre primario (crema) */

    /* Secundario */
    --secondary: 33 58% 96%;        /* crema como fondo secundario */
    --secondary-foreground: 60 2% 17%;

    /* Acento */
    --accent: 165 76% 25%;          /* #0F6E56 verde */
    --accent-foreground: 0 0% 100%;

    /* Destructivo (shadcn default, no personalizado) */
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    /* Bordes y anillos */
    --border: 50 12% 80%;           /* #D3D1C7 */
    --input: 50 12% 80%;
    --ring: 15 68% 52%;             /* terracota para anillo de foco */

    /* Radio base */
    --radius: 0.5rem;               /* 8px — shadcn lo usa como base */

    /* Tarjeta (ya cubierto por --card) */
    --chart-1: 16 68% 51%;          /* terracota para gráficos */
    --chart-2: 160 75% 25%;         /* verde para gráficos */
  }
}
```

> **No se definió dark mode.** La dirección de diseño es light mode explícitamente. Si en el futuro se añade, habría que definir un bloque `.dark { }` con la paleta invertida.

### 5.2 Tokens adicionales (custom, fuera de shadcn)

Estas variables no son estándar de shadcn pero se necesitan para el sistema:

```css
:root {
  /* Terracota botón (accesible para texto blanco) */
  --primary-button: #C44D26;
  --primary-button-hover: #993C1D;

  /* Terracota display (solo para acentos, NO para botones con texto blanco) */
  --primary-display: #D85A30;

  /* Marca texto */
  --primary-strong: #993C1D;

  /* Rampa terracota */
  --terra-50: #FAECE7;
  --terra-100: #F5C4B3;
  --terra-400: #D85A30;
  --terra-600: #C44D26;
  --terra-700: #993C1D;
  --terra-900: #4A1B0C;

  /* Éxito */
  --success-bg: #D6EDE7;
  --success-text: #0F6E56;

  /* Fuentes */
  --font-serif: var(--font-fraunces), ui-serif, serif;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}
```

### 5.3 `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"], // shadcn default, pero no usamos dark mode
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          button: "var(--primary-button)",
          strong: "var(--primary-strong)",
          display: "var(--primary-display)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        terra: {
          50: "var(--terra-50)",
          100: "var(--terra-100)",
          400: "var(--terra-400)",
          600: "var(--terra-600)",
          700: "var(--terra-700)",
          900: "var(--terra-900)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)"],
        sans: ["var(--font-sans)"],
      },
      fontSize: {
        display: ["2.25rem", { lineHeight: "1.1", fontWeight: "600" }],
        h1: ["1.875rem", { lineHeight: "1.15", fontWeight: "600" }],
        h2: ["1.5rem", { lineHeight: "1.2", fontWeight: "500" }],
        h3: ["1.25rem", { lineHeight: "1.3", fontWeight: "500" }],
        body: ["1rem", { lineHeight: "1.7", fontWeight: "400" }],
        small: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "6px",
        md: "calc(var(--radius))",       // 8px
        lg: "calc(var(--radius) + 4px)",  // 12px
        xl: "calc(var(--radius) + 8px)",  // 16px
      },
      spacing: {
        // Escala base 4px (extiende los defaults de Tailwind)
        "18": "4.5rem",  // 72px
      },
    },
  },
  plugins: [require("tailwindcss-animate")], // para shadcn
} satisfies Config;
```

### 5.4 Import de fuentes alternativo (si no usas `next/font`)

Para `index.html` o `<head>` manual, con `font-display: swap`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

Se recomienda `next/font` (sección 2.2) por rendimiento: evita FOIT/FOUT y no necesita `<link>` externo.

---

## 6. Responsive / móvil

No se definieron breakpoints custom. Se usan los defaults de Tailwind (`sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`).

Reglas decididas:
- Tarjetas de curso pasan a **una columna** en móvil.
- Navegación colapsa a **menú hamburguesa** en móvil.
- Botones/enlaces con zona de toque mínima de **44px**.
- Formularios a **ancho completo** en móvil.
- Cuerpo de texto mínimo **16px** (sin zoom).
- Tablas: scroll horizontal o apilado en móvil (no romper el ancho).
- El flujo de compra completo debe funcionar en navegador móvil.

---

## 7. Lo que NO se definió (pendientes explícitos)

Para que Claude Code no invente valores donde no los hay:

- **Dark mode:** no se diseñó. Light mode es la decisión explícita. No implementar dark mode salvo que se pida.
- **Estados semánticos (error, warning, info):** no se definieron tokens de color propios. Usar los defaults de shadcn y ajustar si desentona con el tono cálido.
- **Sombras:** no se definió un sistema. El estilo editorial tiende a flat. Si se necesita, usar algo sutil (`0 1px 3px rgba(0,0,0,0.06)`) para hover/elevación.
- **Animaciones / transiciones:** no se definieron. Usar transiciones suaves estándar (150-200ms ease) para hover y focus. No animar por defecto.
- **Iconos:** no se eligió una librería de iconos. lucide-react es la estándar de shadcn y encaja bien.
- **Sección de proyectos de alumnos:** recomendada pero no especificada en detalle.
- **Portadas reales de cursos:** se usan tipográficas provisionales (CSS) hasta que la Academia las produzca.
