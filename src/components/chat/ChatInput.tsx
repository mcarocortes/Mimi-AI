import { ArrowUp, Sparkles } from 'lucide-react'
import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { useChat } from '../../context/ChatContext'
import { useSettings } from '../../context/SettingsContext'

export function ChatInput() {
  const { requestSend, streaming, coaching } = useChat()
  const { settings } = useSettings()
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const onTemplate = (e: Event) => {
      const prompt = (e as CustomEvent<string>).detail
      if (ref.current) {
        ref.current.value = prompt
        ref.current.focus()
      }
    }
    window.addEventListener('mimi:template', onTemplate)
    return () => window.removeEventListener('mimi:template', onTemplate)
  }, [])

  function submit(skipCoach: boolean) {
    const value = ref.current?.value ?? ''
    void requestSend(value, skipCoach)
    if (ref.current) ref.current.value = ''
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    submit(false)
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(false)
    }
  }

  const busy = streaming || coaching

  return (
    <form onSubmit={onSubmit} className="border-t border-ink/10 bg-cream/80 p-3 backdrop-blur dark:border-white/10 dark:bg-black/80">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-ink/10 bg-paper px-3 py-2 dark:border-white/10 dark:bg-ink-soft">
        <textarea
          ref={ref}
          rows={1}
          onKeyDown={onKey}
          placeholder={
            settings.coachEnabled
              ? 'Escribe algo vago… MIMI lo afinará'
              : 'Escribe un mensaje'
          }
          className="max-h-40 min-h-11 flex-1 resize-none bg-transparent py-2 text-[15px] outline-none"
          disabled={busy}
        />
        {settings.coachEnabled && (
          <button
            type="button"
            disabled={busy}
            title="Enviar sin coach"
            onClick={() => submit(true)}
            className="mb-1 rounded-lg p-2 text-ink-muted hover:bg-ink/5 disabled:opacity-40 dark:hover:bg-white/10"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={busy}
          className="mb-1 flex items-center gap-1 rounded-xl bg-coral px-3 py-2 text-sm font-medium text-white hover:bg-coral-dark disabled:opacity-40"
        >
          <Sparkles className="h-4 w-4" />
          {settings.coachEnabled ? 'Afinar' : 'Enviar'}
        </button>
      </div>
      <p className="mx-auto mt-1.5 max-w-3xl text-center text-[11px] text-ink-muted">
        Enter envía · Shift+Enter salto de línea
        {settings.coachEnabled ? ' · la flecha envía el original' : ''}
      </p>
    </form>
  )
}
