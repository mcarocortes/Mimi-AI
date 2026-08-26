import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { improvePrompt, streamChat } from '../lib/api'
import * as db from '../lib/db'
import type { Conversation, Message, PromptImprovement } from '../lib/types'
import { titleFromPrompt, uid } from '../lib/utils'
import { useAuth } from './AuthContext'
import { useSettings } from './SettingsContext'

type ChatContextValue = {
  conversations: Conversation[]
  activeId: string | null
  messages: Message[]
  streaming: boolean
  coach: PromptImprovement | null
  pendingPrompt: string | null
  coaching: boolean
  error: string | null
  loadConversations: () => Promise<void>
  openConversation: (id: string | null) => Promise<void>
  requestSend: (text: string, skipCoach?: boolean) => Promise<void>
  confirmSend: (useImproved: boolean) => Promise<void>
  cancelCoach: () => void
  rate: (messageId: string, rating: -1 | 1) => Promise<void>
  removeConversation: (id: string) => Promise<void>
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [coach, setCoach] = useState<PromptImprovement | null>(null)
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null)
  const [coaching, setCoaching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const loadConversations = useCallback(async () => {
    if (!user) return
    const list = await db.listConversations(user.id)
    setConversations(list)
  }, [user])

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  const openConversation = useCallback(async (id: string | null) => {
    abortRef.current?.abort()
    setCoach(null)
    setPendingPrompt(null)
    setError(null)
    setActiveId(id)
    if (!id) {
      setMessages([])
      return
    }
    const list = await db.listMessages(id)
    setMessages(list)
  }, [])

  const sendNow = useCallback(
    async (text: string, original?: string | null) => {
      if (!user) return
      setCoach(null)
      setPendingPrompt(null)
      setError(null)

      let convId = activeId
      if (!convId) {
        const conv = await db.createConversation(user.id, titleFromPrompt(text))
        convId = conv.id
        setActiveId(conv.id)
        setConversations((prev) => [conv, ...prev])
        navigate(`/app/c/${conv.id}`, { replace: true })
      } else {
        const conv = conversations.find((c) => c.id === convId)
        if (conv && conv.title === 'Nueva conversación') {
          await db.renameConversation(convId, titleFromPrompt(text))
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId ? { ...c, title: titleFromPrompt(text) } : c,
            ),
          )
        }
      }

      const userMsg = await db.insertMessage({
        conversationId: convId,
        userId: user.id,
        role: 'user',
        content: text,
        originalPrompt: original ?? null,
      })
      const assistantId = uid()
      const assistantMsg: Message = {
        id: assistantId,
        conversationId: convId,
        userId: user.id,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setStreaming(true)

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const controller = new AbortController()
      abortRef.current = controller
      let full = ''
      try {
        await streamChat(
          {
            messages: history,
            settings: {
              model: settings.model,
              tone: settings.tone,
              language: settings.language,
            },
          },
          (delta) => {
            full += delta
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)),
            )
          },
          controller.signal,
        )
        await db.insertMessage({
          id: assistantId,
          conversationId: convId,
          userId: user.id,
          role: 'assistant',
          content: full || '…',
        })
        await loadConversations()
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        const message = err instanceof Error ? err.message : 'Error al responder'
        setError(message)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content || `No pude responder: ${message}` }
              : m,
          ),
        )
      } finally {
        setStreaming(false)
      }
    },
    [user, activeId, conversations, messages, settings, loadConversations, navigate],
  )

  const requestSend = useCallback(
    async (text: string, skipCoach = false) => {
      const trimmed = text.trim()
      if (!trimmed || streaming || coaching) return
      if (!skipCoach && settings.coachEnabled) {
        setPendingPrompt(trimmed)
        setCoaching(true)
        setError(null)
        try {
          const result = await improvePrompt(trimmed, settings.language)
          setCoach(result)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'El coach falló')
          await sendNow(trimmed)
        } finally {
          setCoaching(false)
        }
        return
      }
      await sendNow(trimmed)
    },
    [streaming, coaching, settings.coachEnabled, settings.language, sendNow],
  )

  const confirmSend = useCallback(
    async (useImproved: boolean) => {
      if (!pendingPrompt) return
      const improved = coach?.improved?.trim()
      if (useImproved && improved) {
        await sendNow(improved, pendingPrompt)
      } else {
        await sendNow(pendingPrompt)
      }
    },
    [pendingPrompt, coach, sendNow],
  )

  const cancelCoach = useCallback(() => {
    setCoach(null)
    setPendingPrompt(null)
    setCoaching(false)
  }, [])

  const rate = useCallback(async (messageId: string, rating: -1 | 1) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, rating: m.rating === rating ? null : rating } : m,
      ),
    )
    const current = messages.find((m) => m.id === messageId)
    const next = current?.rating === rating ? null : rating
    await db.rateMessage(messageId, next)
  }, [messages])

  const removeConversation = useCallback(
    async (id: string) => {
      await db.deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeId === id) {
        setActiveId(null)
        setMessages([])
        navigate('/app')
      }
    },
    [activeId, navigate],
  )

  const value = useMemo(
    () => ({
      conversations,
      activeId,
      messages,
      streaming,
      coach,
      pendingPrompt,
      coaching,
      error,
      loadConversations,
      openConversation,
      requestSend,
      confirmSend,
      cancelCoach,
      rate,
      removeConversation,
    }),
    [
      conversations,
      activeId,
      messages,
      streaming,
      coach,
      pendingPrompt,
      coaching,
      error,
      loadConversations,
      openConversation,
      requestSend,
      confirmSend,
      cancelCoach,
      rate,
      removeConversation,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
