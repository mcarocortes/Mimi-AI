import type { PromptImprovement, UserSettings } from './types'

type ChatPayload = {
  messages: { role: 'user' | 'assistant'; content: string }[]
  settings: Pick<UserSettings, 'model' | 'tone' | 'language'>
}

async function readSse(
  res: Response,
  onDelta: (text: string) => void,
) {
  if (!res.ok || !res.body) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(err || `Error ${res.status}`)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''
    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith('data:')) continue
      const json = line.slice(5).trim()
      if (!json || json === '[DONE]') continue
      const data = JSON.parse(json) as { text?: string; error?: string }
      if (data.error) throw new Error(data.error)
      if (data.text) onDelta(data.text)
    }
  }
}

export async function streamChat(
  payload: ChatPayload,
  onDelta: (text: string) => void,
  signal?: AbortSignal,
) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
  await readSse(res, onDelta)
}

export async function improvePrompt(
  prompt: string,
  language: UserSettings['language'],
): Promise<PromptImprovement> {
  const res = await fetch('/api/improve-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, language }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(err || 'No se pudo mejorar el prompt')
  }
  return (await res.json()) as PromptImprovement
}
