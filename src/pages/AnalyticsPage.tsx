import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listAllMessages } from '../lib/db'
import type { Message } from '../lib/types'

export function AnalyticsPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!user) return
    void listAllMessages(user.id).then(setMessages)
  }, [user])

  const stats = useMemo(() => {
    const assistant = messages.filter((m) => m.role === 'assistant').slice(0, 50)
    const liked = assistant.filter((m) => m.rating === 1).length
    const disliked = assistant.filter((m) => m.rating === -1).length
    const rated = liked + disliked
    const unrated = assistant.length - rated
    const pct = rated === 0 ? 0 : Math.round((liked / rated) * 100)
    return { total: assistant.length, liked, disliked, unrated, pct, rated }
  }, [messages])

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl">Analítica</h1>
        <p className="mt-1 text-ink-muted">
          De tus últimas {stats.total} respuestas de MIMI
          {stats.rated === 0
            ? ', todavía no hay votos. Dale 👍 o 👎 en el chat.'
            : `, un ${stats.pct}% de las valoradas te gustaron.`}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Respuestas" value={stats.total} />
          <Stat label="👍" value={stats.liked} accent="coral" />
          <Stat label="👎" value={stats.disliked} accent="muted" />
          <Stat label="Sin voto" value={stats.unrated} />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/5 dark:bg-ink-soft dark:ring-white/10">
          <div className="flex h-4">
            <div
              className="bg-coral"
              style={{ width: `${stats.total ? (stats.liked / stats.total) * 100 : 0}%` }}
            />
            <div
              className="bg-ink-soft"
              style={{ width: `${stats.total ? (stats.disliked / stats.total) * 100 : 0}%` }}
            />
            <div className="flex-1 bg-ink/10 dark:bg-white/10" />
          </div>
          <div className="flex justify-between px-4 py-3 text-xs text-ink-muted">
            <span>Me gustaron</span>
            <span>No tanto</span>
            <span>Sin votar</span>
          </div>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-ink-muted">
          Esto es producto, no vanidad: si el porcentaje baja, el coach de prompts o el tono
          de ajustes son el primer sitio donde mirar. En un portafolio cuenta más que
          «llamo a una API».
        </p>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: 'coral' | 'muted'
}) {
  return (
    <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/5 dark:bg-ink-soft dark:ring-white/10">
      <p className="text-xs text-ink-muted">{label}</p>
      <p
        className={`mt-1 font-display text-3xl ${
          accent === 'coral' ? 'text-coral' : accent === 'muted' ? 'text-ink-muted' : ''
        }`}
      >
        {value}
      </p>
    </div>
  )
}
