import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function uid() {
  return crypto.randomUUID()
}

export function nowIso() {
  return new Date().toISOString()
}

export function titleFromPrompt(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return 'Nueva conversación'
  return clean.length > 42 ? `${clean.slice(0, 42)}…` : clean
}

export function formatWhen(iso: string, language: 'es' | 'en' = 'es') {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return language === 'es' ? 'Ahora' : 'Now'
  if (min < 60) return language === 'es' ? `Hace ${min} min` : `${min} min ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return language === 'es' ? `Hace ${hrs} h` : `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return language === 'es' ? 'Ayer' : 'Yesterday'
  if (days < 7) return language === 'es' ? `Hace ${days} días` : `${days}d ago`
  return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric',
    month: 'short',
  })
}
