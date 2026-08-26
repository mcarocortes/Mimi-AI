export type Role = 'user' | 'assistant'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Tone = 'amigable' | 'profesional' | 'conciso' | 'creativo' | 'docente'
export type AppLanguage = 'es' | 'en'

export type UserSettings = {
  displayName: string
  model: string
  tone: Tone
  language: AppLanguage
  theme: ThemeMode
  coachEnabled: boolean
}

export type AppUser = {
  id: string
  email: string
  displayName: string
}

export type Conversation = {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
}

export type Message = {
  id: string
  conversationId: string
  userId: string
  role: Role
  content: string
  originalPrompt?: string | null
  rating?: -1 | 1 | null
  createdAt: string
}

export type PromptImprovement = {
  improved: string
  reason: string
  tips: string[]
}

export type PromptTemplate = {
  id: string
  category: string
  title: string
  description: string
  prompt: string
}

export const DEFAULT_SETTINGS: UserSettings = {
  displayName: '',
  model: 'claude-sonnet-4-5',
  tone: 'amigable',
  language: 'es',
  theme: 'system',
  coachEnabled: true,
}

export const MODELS = [
  { id: 'claude-sonnet-4-5', label: 'Sonnet 4.5', hint: 'Equilibrio — el de cada día' },
  { id: 'claude-opus-4-1', label: 'Opus 4.1', hint: 'Más profundidad' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5', hint: 'Rápido y ligero' },
] as const

export const TONES: { id: Tone; label: string; hint: string }[] = [
  { id: 'amigable', label: 'Amigable', hint: 'Cercana, cálida, con un toque de humor' },
  { id: 'profesional', label: 'Profesional', hint: 'Formal y estructurada' },
  { id: 'conciso', label: 'Concisa', hint: 'Corta, sin relleno' },
  { id: 'creativo', label: 'Creativa', hint: 'Imaginativa y con metáforas' },
  { id: 'docente', label: 'Docente', hint: 'Paso a paso, como una buena profesora' },
]
