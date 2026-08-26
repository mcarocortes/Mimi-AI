type Size = 'sm' | 'md' | 'lg' | 'hero'

const SIZES: Record<Size, string> = {
  sm: 'h-10 w-10',
  md: 'h-28 w-28',
  lg: 'h-64 w-64 sm:h-80 sm:w-80',
  hero: 'h-[min(72vh,34rem)] w-auto max-w-[28rem]',
}

type Props = {
  className?: string
  size?: Size
  /** Cuando la escena de Spline esté lista, pásala aquí (URL .splinecode). */
  splineUrl?: string
}

export function MimiScene({ className = '', size = 'md', splineUrl }: Props) {
  if (splineUrl) {
    return (
      <iframe
        title="MIMI"
        src={splineUrl}
        className={`border-0 bg-transparent ${SIZES[size]} ${className}`}
        allow="autoplay"
      />
    )
  }

  return (
    <img
      src="/mimi.png"
      alt="MIMI, la astronauta"
      className={`object-contain drop-shadow-2xl select-none ${SIZES[size]} ${className}`}
      draggable={false}
    />
  )
}
