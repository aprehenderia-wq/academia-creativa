This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Despliegue y entornos

Este proyecto usa dos entornos diferenciados, cada uno ligado a una rama de Git:

**Producción (`main`)**
Cada vez que se fusiona código a la rama `main`, Vercel despliega automáticamente la versión actualizada al entorno de producción. Esta es la versión que ven los usuarios reales.
URL: https://academia-creativa-one.vercel.app

**Staging / Vista previa (`develop`)**
La rama `develop` tiene su propio despliegue automático en Vercel. Cada push a `develop` actualiza esta URL, que siempre apunta al último estado de la rama.
URL: https://academia-creativa-git-develop-aprehenderia-9285s-projects.vercel.app

**La regla de oro**
Nada va directamente a `main`. Todo cambio sigue este camino:

1. Se crea una rama `feature/nombre-de-la-funcionalidad` a partir de `develop`.
2. Se desarrolla y prueba en local.
3. Se fusiona a `develop` y se verifica en el entorno de staging.
4. Solo cuando está validado, se fusiona a `main` y llega a producción.
