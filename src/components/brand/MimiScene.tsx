import { useEffect, useRef } from 'react'
import { MIMI_PNG } from '../../lib/assets'

type Size = 'sm' | 'md' | 'lg' | 'hero'

const SIZES: Record<Size, string> = {
  sm: 'h-10 w-10',
  md: 'h-28 w-28',
  lg: 'h-64 w-64 sm:h-80 sm:w-80',
  hero: 'h-[min(72vh,34rem)] w-auto max-w-[28rem]',
}

const SPLINE_HERO =
  'h-[min(72vh,34rem)] w-full max-w-[28rem]'

const SPLINE_VIEWER_SRC =
  'https://cdn.spline.design/@splinetool/viewer@2.0.7/build/spline-viewer.js'

type Props = {
  className?: string
  size?: Size
  /** URL .splinecode de Spline. */
  splineUrl?: string
  /** Pausa el render sin descargar la escena. */
  paused?: boolean
}

type SplineViewerEl = HTMLElement & {
  _spline?: {
    stop?: () => void
    play?: () => void
  }
}

function loadSplineViewer() {
  if (document.querySelector(`script[src="${SPLINE_VIEWER_SRC}"]`)) return
  const script = document.createElement('script')
  script.type = 'module'
  script.src = SPLINE_VIEWER_SRC
  document.head.appendChild(script)
}

function setSplinePaused(el: SplineViewerEl | null, paused: boolean) {
  const spline = el?._spline
  if (!spline) return
  try {
    if (paused) spline.stop?.()
    else spline.play?.()
  } catch {
    // Internals of Spline
  }
}

function SplineEmbed({
  url,
  className,
  paused = false,
}: {
  url: string
  className: string
  paused?: boolean
}) {
  const viewerRef = useRef<SplineViewerEl | null>(null)

  useEffect(() => {
    loadSplineViewer()
  }, [])

  useEffect(() => {
    const el = viewerRef.current
    if (!el) return
    const sync = () => setSplinePaused(el, paused)
    sync()
    el.addEventListener('load-complete', sync)
    return () => el.removeEventListener('load-complete', sync)
  }, [paused])

  return (
    <div className={`relative overflow-hidden [transform:translateZ(0)] ${className}`}>
      <spline-viewer
        ref={(el) => {
          viewerRef.current = el as SplineViewerEl | null
        }}
        url={url}
        aria-label="MIMI"
        className="absolute left-0 top-0 w-full bg-transparent"
        style={{ height: 'calc(100% + 5.5rem)' }}
      />
    </div>
  )
}

export function MimiScene({
  className = '',
  size = 'md',
  splineUrl,
  paused,
}: Props) {
  if (splineUrl) {
    return (
      <SplineEmbed
        url={splineUrl}
        paused={paused}
        className={`${size === 'hero' ? SPLINE_HERO : SIZES[size]} ${className}`}
      />
    )
  }

  return (
    <img
      src={MIMI_PNG}
      alt="MIMI, la astronauta"
      className={`object-contain drop-shadow-2xl select-none ${SIZES[size]} ${className}`}
      draggable={false}
    />
  )
}
