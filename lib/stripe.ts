import 'server-only'

import Stripe from 'stripe'

// Instancia única de Stripe para usar en Route Handlers y Server Actions.
// Usa la clave secreta del servidor — nunca llega al navegador gracias a
// 'server-only', que lanza un error de compilación si se intenta importar
// este archivo desde un componente con 'use client'.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
})
