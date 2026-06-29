import { ImageResponse } from 'next/og'
import { DEFAULT_COVER_COLOR } from '@/lib/constants/category-colors'

export const runtime = 'edge'

const logoSvg =
  '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="40" height="40" rx="8" fill="rgba(255,255,255,0.2)"/>' +
  '<polygon points="20,9 8,31 32,31" fill="none" stroke="white" stroke-width="1.8" stroke-linejoin="round"/>' +
  '<line x1="20" y1="9" x2="20" y2="31" stroke="white" stroke-width="1.8"/>' +
  '<path d="M 12,20 A 8,8 0 0,1 28,20" fill="none" stroke="white" stroke-width="1.8"/>' +
  '</svg>'

const logoDataUrl = `data:image/svg+xml;base64,${btoa(logoSvg)}`

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: DEFAULT_COVER_COLOR,
          gap: '28px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoDataUrl} width={110} height={110} alt="" />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: '72px',
              fontWeight: '600',
              letterSpacing: '-2px',
              lineHeight: '1',
            }}
          >
            Academia Creativa
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.78)',
              fontSize: '30px',
              letterSpacing: '0.5px',
            }}
          >
            Cursos de diseño digital
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
