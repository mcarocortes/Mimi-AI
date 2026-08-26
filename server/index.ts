import Anthropic from '@anthropic-ai/sdk'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const port = Number(process.env.PORT || 3001)
const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
const anthropic = apiKey ? new Anthropic({ apiKey }) : null

type Tone = 'amigable' | 'profesional' | 'conciso' | 'creativo' | 'docente'
type Lang = 'es' | 'en'

const TONE_GUIDE: Record<Tone, string> = {
  amigable: 'Cercana, cálida, con humor ligero. Nunca empalagosa.',
  profesional: 'Formal, clara y estructurada. Sin jerga vacía.',
  conciso: 'Respuestas cortas. Viñetas. Cero relleno.',
  creativo: 'Imaginativa, con metáforas útiles. No sacrifiques claridad.',
  docente: 'Explica paso a paso, anticipa dudas, como una buena profesora.',
}

function systemPrompt(tone: Tone, language: Lang) {
  const lang = language === 'en' ? 'English' : 'español'
  return `Eres MIMI, una asistente de IA para un portafolio: útil, honesta y concreta.
Idioma: responde siempre en ${lang}.
Tono: ${TONE_GUIDE[tone] ?? TONE_GUIDE.amigable}
Si el usuario pega código, prioriza el diagnóstico. Si pide ideas, dame opciones reales, no relleno.
Nunca inventes que tienes memoria más allá de esta conversación.`
}

function heuristicImprove(prompt: string): {
  improved: string
  reason: string
  tips: string[]
} {
  const trimmed = prompt.trim()
  return {
    improved: `Actúa como experta en el tema. Tarea: ${trimmed}

Contexto: [añade para quién es y qué ya has intentado].
Formato de salida: secciones con títulos claros; usa viñetas cuando ayude.
Restricciones: sé específica, evita generalidades y no des relleno motivacional.
Criterio de calidad: la respuesta debe ser accionable (puedo usarla hoy).`,
    reason:
      'Tu prompt decía el qué, pero no el para quién, el formato ni cómo se ve “bien hecho”. Eso es lo que más suele fallar.',
    tips: [
      'Incluye audiencia y nivel (novato, colega, cliente).',
      'Pide un formato de salida concreto.',
      'Añade una restricción: qué NO quieres.',
    ],
  }
}

async function simulateStream(text: string, write: (chunk: string) => void) {
  const parts = text.split(/(\s+)/)
  for (const part of parts) {
    write(part)
    await new Promise((r) => setTimeout(r, 12))
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, anthropic: Boolean(anthropic) })
})

app.post('/api/improve-prompt', async (req, res) => {
  const prompt = String(req.body?.prompt ?? '').trim()
  const language: Lang = req.body?.language === 'en' ? 'en' : 'es'
  if (!prompt) {
    res.status(400).json({ error: 'Falta el prompt' })
    return
  }

  if (!anthropic) {
    res.json(heuristicImprove(prompt))
    return
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 800,
      system: `Eres una coach de prompt engineering. NO ejecutes el prompt: mejóralo.
Devuelve SOLO JSON válido con esta forma:
{"improved":"string","reason":"string","tips":["string","string"]}
Mantén el idioma del usuario (${language === 'en' ? 'English' : 'español'}).
El prompt mejorado debe incluir, cuando falten: rol, contexto, formato de salida, restricciones y criterio de calidad.
reason: una frase humana, no jerga. tips: 2 o 3, cortos.`,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as {
      improved: string
      reason: string
      tips: string[]
    }
    res.json({
      improved: parsed.improved,
      reason: parsed.reason,
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
    })
  } catch (error) {
    console.error(error)
    res.json(heuristicImprove(prompt))
  }
})

app.post('/api/chat', async (req, res) => {
  const settings = req.body?.settings ?? {}
  const tone: Tone = settings.tone ?? 'amigable'
  const language: Lang = settings.language === 'en' ? 'en' : 'es'
  const model = String(settings.model || 'claude-sonnet-4-5')
  const messages = (req.body?.messages ?? []) as {
    role: 'user' | 'assistant'
    content: string
  }[]

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Faltan mensajes' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  const send = (payload: unknown) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''

  try {
    if (!anthropic) {
      const demo =
        language === 'en'
          ? `I'm MIMI in demo mode (no Anthropic key yet), but here's a structured take on: "${lastUser.slice(0, 180)}"\n\n**What I'd do**\n- Clarify the goal in one sentence\n- Split the work into 3 concrete steps\n- Call out the risk most people miss\n\nAdd ANTHROPIC_API_KEY to \`.env\` to get a real streamed answer.`
          : `Estoy en modo demo (aún no hay clave de Anthropic), pero aquí va una respuesta de muestra a: «${lastUser.slice(0, 180)}»\n\n**Lo que haría MIMI de verdad**\n- Aclarar el objetivo en una frase\n- Partirlo en 3 pasos concretos\n- Señalar el riesgo que casi nadie menciona\n\nAñade \`ANTHROPIC_API_KEY\` en \`.env\` para una respuesta real con streaming.`
      await simulateStream(demo, (text) => send({ text }))
      send({ done: true })
      res.end()
      return
    }

    const stream = anthropic.messages.stream({
      model,
      max_tokens: 4096,
      system: systemPrompt(tone, language),
      messages: messages
        .filter((m) => m.content.trim())
        .map((m) => ({ role: m.role, content: m.content })),
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        send({ text: event.delta.text })
      }
    }
    send({ done: true })
    res.end()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al generar'
    send({ error: message })
    res.end()
  }
})

app.listen(port, () => {
  console.log(`MIMI API → http://127.0.0.1:${port}  (Anthropic: ${anthropic ? 'on' : 'demo'})`)
})
