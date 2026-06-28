import Image from 'next/image'

export function LogoMark({ size = 34 }: { size?: number }) {
  const textSize = Math.round(size * 0.42)

  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/images/logo.png"
        alt=""
        width={size}
        height={size}
        className="object-contain"
      />
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
      <Image
        src="/images/logo.png"
        alt=""
        width={size}
        height={size}
        className="object-contain"
      />
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
