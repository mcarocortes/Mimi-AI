import { Sparkles, X } from 'lucide-react'
import { useChat } from '../../context/ChatContext'

export function PromptCoach() {
  const { coach, pendingPrompt, coaching, confirmSend, cancelCoach } = useChat()

  if (!coaching && !coach) return null

  return (
    <div className="border-t border-ink/10 bg-blush/50 px-4 py-3 dark:border-white/10 dark:bg-coral/10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-coral" />
            Prompt coach
          </p>
          <button onClick={cancelCoach} className="rounded p-1 hover:bg-ink/5" aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>
        {coaching && (
          <p className="text-sm text-ink-muted">MIMI está reescribiendo tu prompt…</p>
        )}
        {coach && pendingPrompt && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{coach.reason}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-paper/80 p-3 text-sm dark:bg-ink/40">
                <p className="mb-1 text-[11px] uppercase tracking-wide text-ink-muted">Tu versión</p>
                <p className="whitespace-pre-wrap text-ink/80 dark:text-cream/80">{pendingPrompt}</p>
              </div>
              <div className="rounded-xl bg-paper p-3 text-sm ring-1 ring-coral/30 dark:bg-ink-soft">
                <p className="mb-1 text-[11px] uppercase tracking-wide text-coral">Mejorada</p>
                <p className="whitespace-pre-wrap">{coach.improved}</p>
              </div>
            </div>
            {coach.tips.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-ink-muted">
                {coach.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void confirmSend(true)}
                className="rounded-xl bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-dark"
              >
                Usar la mejorada
              </button>
              <button
                onClick={() => void confirmSend(false)}
                className="rounded-xl border border-ink/15 px-4 py-2 text-sm hover:bg-paper dark:hover:bg-ink-soft"
              >
                Enviar original
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
