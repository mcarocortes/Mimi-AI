import { getSupabase, isSupabaseConfigured } from './supabase'
import {
  DEFAULT_SETTINGS,
  type Conversation,
  type Message,
  type UserSettings,
} from './types'
import { nowIso, uid } from './utils'

const LS_KEY = 'mimi-local-db'

type LocalDb = {
  conversations: Conversation[]
  messages: Message[]
  settings: Record<string, UserSettings>
}

function emptyDb(): LocalDb {
  return { conversations: [], messages: [], settings: {} }
}

function readDb(): LocalDb {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return emptyDb()
    return { ...emptyDb(), ...JSON.parse(raw) } as LocalDb
  } catch {
    return emptyDb()
  }
}

function writeDb(db: LocalDb) {
  localStorage.setItem(LS_KEY, JSON.stringify(db))
}

function mapConversation(row: Record<string, unknown>): Conversation {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    userId: String(row.user_id),
    role: row.role === 'assistant' ? 'assistant' : 'user',
    content: String(row.content),
    originalPrompt: (row.original_prompt as string | null) ?? null,
    rating: (row.rating as -1 | 1 | null) ?? null,
    createdAt: String(row.created_at),
  }
}

export async function listConversations(userId: string): Promise<Conversation[]> {
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => mapConversation(row as Record<string, unknown>))
  }
  return readDb()
    .conversations.filter((c) => c.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function createConversation(userId: string, title = 'Nueva conversación') {
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: userId, title })
      .select()
      .single()
    if (error) throw error
    return mapConversation(data as Record<string, unknown>)
  }
  const conv: Conversation = {
    id: uid(),
    userId,
    title,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  const db = readDb()
  db.conversations.unshift(conv)
  writeDb(db)
  return conv
}

export async function renameConversation(id: string, title: string) {
  const supabase = getSupabase()
  if (supabase) {
    const { error } = await supabase
      .from('conversations')
      .update({ title, updated_at: nowIso() })
      .eq('id', id)
    if (error) throw error
    return
  }
  const db = readDb()
  const conv = db.conversations.find((c) => c.id === id)
  if (conv) {
    conv.title = title
    conv.updatedAt = nowIso()
    writeDb(db)
  }
}

export async function touchConversation(id: string) {
  const supabase = getSupabase()
  if (supabase) {
    await supabase.from('conversations').update({ updated_at: nowIso() }).eq('id', id)
    return
  }
  const db = readDb()
  const conv = db.conversations.find((c) => c.id === id)
  if (conv) {
    conv.updatedAt = nowIso()
    writeDb(db)
  }
}

export async function deleteConversation(id: string) {
  const supabase = getSupabase()
  if (supabase) {
    const { error } = await supabase.from('conversations').delete().eq('id', id)
    if (error) throw error
    return
  }
  const db = readDb()
  db.conversations = db.conversations.filter((c) => c.id !== id)
  db.messages = db.messages.filter((m) => m.conversationId !== id)
  writeDb(db)
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map((row) => mapMessage(row as Record<string, unknown>))
  }
  return readDb()
    .messages.filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function listAllMessages(userId: string): Promise<Message[]> {
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    return (data ?? []).map((row) => mapMessage(row as Record<string, unknown>))
  }
  return readDb()
    .messages.filter((m) => m.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function insertMessage(
  input: Omit<Message, 'id' | 'createdAt'> & { id?: string; createdAt?: string },
): Promise<Message> {
  const message: Message = {
    id: input.id ?? uid(),
    conversationId: input.conversationId,
    userId: input.userId,
    role: input.role,
    content: input.content,
    originalPrompt: input.originalPrompt ?? null,
    rating: input.rating ?? null,
    createdAt: input.createdAt ?? nowIso(),
  }
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        id: message.id,
        conversation_id: message.conversationId,
        user_id: message.userId,
        role: message.role,
        content: message.content,
        original_prompt: message.originalPrompt,
        rating: message.rating,
      })
      .select()
      .single()
    if (error) throw error
    await touchConversation(message.conversationId)
    return mapMessage(data as Record<string, unknown>)
  }
  const db = readDb()
  db.messages.push(message)
  const conv = db.conversations.find((c) => c.id === message.conversationId)
  if (conv) conv.updatedAt = nowIso()
  writeDb(db)
  return message
}

export async function updateMessageContent(id: string, content: string) {
  const supabase = getSupabase()
  if (supabase) {
    const { error } = await supabase.from('messages').update({ content }).eq('id', id)
    if (error) throw error
    return
  }
  const db = readDb()
  const msg = db.messages.find((m) => m.id === id)
  if (msg) {
    msg.content = content
    writeDb(db)
  }
}

export async function rateMessage(id: string, rating: -1 | 1 | null) {
  const supabase = getSupabase()
  if (supabase) {
    const { error } = await supabase.from('messages').update({ rating }).eq('id', id)
    if (error) throw error
    return
  }
  const db = readDb()
  const msg = db.messages.find((m) => m.id === id)
  if (msg) {
    msg.rating = rating
    writeDb(db)
  }
}

export async function getSettings(userId: string): Promise<UserSettings> {
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    if (!data) return { ...DEFAULT_SETTINGS }
    return {
      displayName: data.display_name ?? '',
      model: data.preferred_model ?? DEFAULT_SETTINGS.model,
      tone: data.tone ?? DEFAULT_SETTINGS.tone,
      language: data.language ?? DEFAULT_SETTINGS.language,
      theme: data.theme ?? DEFAULT_SETTINGS.theme,
      coachEnabled: data.coach_enabled ?? true,
    }
  }
  return { ...DEFAULT_SETTINGS, ...readDb().settings[userId] }
}

export async function saveSettings(userId: string, settings: UserSettings) {
  const supabase = getSupabase()
  if (supabase) {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: settings.displayName,
      preferred_model: settings.model,
      tone: settings.tone,
      language: settings.language,
      theme: settings.theme,
      coach_enabled: settings.coachEnabled,
      updated_at: nowIso(),
    })
    if (error) throw error
    return
  }
  const db = readDb()
  db.settings[userId] = settings
  writeDb(db)
}

export { isSupabaseConfigured }
