import Link from "next/link"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-6 flex items-center h-16">
        <Link
          href="/"
          className="font-serif text-h3 text-foreground hover:text-primary-strong transition-colors"
        >
          Academia Creativa
        </Link>
      </div>
    </header>
  )
}
