import { useEffect, useState } from 'react'

type BeforeInstall = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstall | null>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvent(e as BeforeInstall)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (!event || hidden) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40">
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper px-4 py-3 shadow-lg dark:border-white/10 dark:bg-ink-soft">
        <p className="text-sm">Instala MIMI como app</p>
        <button
          className="rounded-lg bg-coral px-3 py-1.5 text-sm text-white"
          onClick={async () => {
            await event.prompt()
            setHidden(true)
          }}
        >
          Instalar
        </button>
        <button className="text-sm text-ink-muted" onClick={() => setHidden(true)}>
          Ahora no
        </button>
      </div>
    </div>
  )
}
