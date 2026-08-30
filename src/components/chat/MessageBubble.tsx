import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { MIMI_PNG } from '../../lib/assets'
import type { Message } from '../../lib/types'
import { cn } from '../../lib/utils'

function renderContent(text: string) {
  const chunks = text.split(/(```[\s\S]*?```)/g)
  return chunks.map((chunk, i) => {
    if (chunk.startsWith('```')) {
      const inner = chunk.replace(/^```\w*\n?/, '').replace(/```$/, '')
      return (
        <pre
          key={i}
          className="my-2 overflow-x-auto rounded-xl bg-ink px-3 py-2 text-[13px] text-cream"
        >
          <code>{inner}</code>
        </pre>
      )
    }
    return (
      <span key={i} className="whitespace-pre-wrap">
        {chunk}
      </span>
    )
  })
}

export function MessageBubble({
  message,
  streaming,
  onRate,
}: {
  message: Message
  streaming?: boolean
  onRate: (rating: -1 | 1) => void
}) {
  const mine = message.role === 'user'
  return (
    <article className={cn('flex gap-3', mine ? 'justify-end' : 'justify-start')}>
      {!mine && (
        <img
          src={MIMI_PNG}
          alt=""
          className="mt-1 h-8 w-8 shrink-0 rounded-full bg-coral object-cover object-[center_12%]"
        />
      )}
      <div className={cn('max-w-[min(42rem,85%)]', mine && 'text-right')}>
        {message.originalPrompt && (
          <p className="mb-1 text-[11px] text-ink-muted">
            Prompt original: «{message.originalPrompt}»
          </p>
        )}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-left text-[15px] leading-relaxed',
            mine
              ? 'bg-ink text-cream dark:bg-coral'
              : 'bg-paper shadow-sm ring-1 ring-ink/5 dark:bg-ink-soft dark:ring-white/10',
          )}
        >
          {message.content ? renderContent(message.content) : streaming ? '▍' : ''}
          {streaming && message.content ? (
            <span className="ml-0.5 inline-block animate-pulse">▍</span>
          ) : null}
        </div>
        {!mine && !streaming && message.content && (
          <div className="mt-1 flex gap-1">
            <button
              className={cn(
                'rounded-md p-1 hover:bg-ink/5 dark:hover:bg-white/10',
                message.rating === 1 && 'text-coral',
              )}
              aria-label="Me gusta"
              onClick={() => onRate(1)}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              className={cn(
                'rounded-md p-1 hover:bg-ink/5 dark:hover:bg-white/10',
                message.rating === -1 && 'text-ink-muted',
              )}
              aria-label="No me gusta"
              onClick={() => onRate(-1)}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
