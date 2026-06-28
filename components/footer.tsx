import { LogoMark } from '@/components/logo'

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <LogoMark size={28} />
        <p className="text-small text-muted-foreground">
          © 2026 Academia Creativa
        </p>
      </div>
    </footer>
  )
}
