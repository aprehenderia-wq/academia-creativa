function LogoIcon({
  inverted = false,
  size = 36,
}: {
  inverted?: boolean
  size?: number
}) {
  const bg = inverted ? '#ffffff' : '#C44D26'
  const symbol = inverted ? '#C44D26' : '#ffffff'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="40" height="40" rx="8" fill={bg} />
      <polygon
        points="20,9 8,31 32,31"
        fill="none"
        stroke={symbol}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <line x1="20" y1="9" x2="20" y2="31" stroke={symbol} strokeWidth="1.8" />
      <path
        d="M 12,20 A 8,8 0 0,1 28,20"
        fill="none"
        stroke={symbol}
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function LogoMark({ size = 34 }: { size?: number }) {
  const textSize = Math.round(size * 0.42)

  return (
    <div className="flex items-center gap-2.5">
      <LogoIcon size={size} />
      <div className="flex flex-col leading-none gap-0.5">
        <span
          className="font-serif font-semibold text-foreground"
          style={{ fontSize: textSize }}
        >
          Academia
        </span>
        <span
          className="font-serif italic text-primary-button"
          style={{ fontSize: textSize, fontWeight: 400 }}
        >
          Creativa
        </span>
      </div>
    </div>
  )
}

export function LogoMarkInverted({ size = 34 }: { size?: number }) {
  const textSize = Math.round(size * 0.42)

  return (
    <div className="flex items-center gap-2.5">
      <LogoIcon inverted size={size} />
      <div className="flex flex-col leading-none gap-0.5">
        <span
          className="font-serif font-semibold text-white"
          style={{ fontSize: textSize }}
        >
          Academia
        </span>
        <span
          className="font-serif italic"
          style={{ fontSize: textSize, fontWeight: 400, color: '#FAECE7' }}
        >
          Creativa
        </span>
      </div>
    </div>
  )
}
