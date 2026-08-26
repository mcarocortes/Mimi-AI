import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import { ChatInput } from '../components/chat/ChatInput'
import { MessageBubble } from '../components/chat/MessageBubble'
import { PromptCoach } from '../components/chat/PromptCoach'
import { PromptTemplates } from '../components/chat/PromptTemplates'
import { MimiScene } from '../components/brand/MimiScene'

export function ChatPage() {
  const { id } = useParams()
  const { messages, streaming, error, openConversation, rate, activeId } = useChat()
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const next = id ?? null
    if (next === activeId) return
    void openConversation(next)
  }, [id, activeId, openConversation])

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const empty = messages.length === 0 && !id && !activeId

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        {empty ? (
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex flex-col items-center text-center">
              <MimiScene size="md" className="mb-4" />
              <h1 className="font-display text-4xl font-semibold">¿En qué te ayudo hoy?</h1>
              <p className="mt-2 max-w-md text-ink-muted">
                Elige una plantilla o escribe a tu aire. Si el prompt es vago, el coach lo
                reescribe antes de llamar al modelo.
              </p>
            </div>
            <PromptTemplates />
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map((m, i) => (
              <MessageBubble
                key={m.id}
                message={m}
                streaming={streaming && i === messages.length - 1 && m.role === 'assistant'}
                onRate={(r) => void rate(m.id, r)}
              />
            ))}
            <div ref={bottom} />
          </div>
        )}
        {error && (
          <p className="mx-auto mt-4 max-w-3xl rounded-xl bg-coral/10 px-3 py-2 text-sm text-coral">
            {error}
          </p>
        )}
      </div>
      <PromptCoach />
      <ChatInput />
    </div>
  )
}
