import type { Metadata } from "next"
import { Inter, Fraunces } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { PageWrapper } from "@/components/page-wrapper"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://academia-creativa-one.vercel.app'
const OG_DESCRIPTION = 'Cursos de diseño digital para creativos que quieren vivir de lo que aman.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Academia Creativa — Cursos de diseño digital',
    template: '%s — Academia Creativa',
  },
  description: OG_DESCRIPTION,
  openGraph: {
    siteName: 'Academia Creativa',
    locale: 'es_ES',
    type: 'website',
    url: SITE_URL,
    title: 'Academia Creativa',
    description: OG_DESCRIPTION,
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Academia Creativa' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Academia Creativa',
    description: OG_DESCRIPTION,
    images: ['/og'],
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-background text-foreground">
        <Navbar />
        <main className="flex-1">
          <PageWrapper>{children}</PageWrapper>
        </main>
        <Footer />
        <Toaster position="top-right" duration={3500} />
      </body>
    </html>
  )
}
