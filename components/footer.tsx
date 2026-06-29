import { LogoMark } from '@/components/logo'

export default function Footer() {
  return (
    <footer className="w-full bg-background">
      <div
        className="h-[3px] w-full"
        style={{ background: 'linear-gradient(to right, #C44D26, #9A5F0F, #0F6E56, #534AB7)' }}
      />
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <LogoMark size={28} />
        <p className="text-small text-muted-foreground">
          © 2026 Academia Creativa
        </p>
      </div>
    </footer>
  )
}
