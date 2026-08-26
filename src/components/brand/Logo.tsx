import logoBgBlack from '../../assets/logo_bgBlack.png'

export function Logo({ className = 'h-9 w-auto' }: { className?: string }) {
  return (
    <img
      src={logoBgBlack}
      alt="MIMI"
      className={`rounded-lg object-contain ${className}`}
      draggable={false}
    />
  )
}
