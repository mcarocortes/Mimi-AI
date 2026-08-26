import type { ReactNode } from 'react'
import { MODELS, TONES, type AppLanguage, type ThemeMode, type Tone } from '../lib/types'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'

export function SettingsPage() {
  const { user, isDemo } = useAuth()
  const { settings, patchSettings } = useSettings()

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8">
      <div className="mx-auto max-w-xl space-y-8">
        <header>
          <h1 className="font-display text-3xl">Ajustes</h1>
          <p className="mt-1 text-ink-muted">
            Cómo se comporta MIMI contigo. Se guarda por cuenta
            {isDemo ? ' (en este navegador)' : ''}.
          </p>
        </header>

        <Field label="Cómo te llama">
          <input
            value={settings.displayName}
            onChange={(e) => void patchSettings({ displayName: e.target.value })}
            placeholder={user?.email}
            className="w-full rounded-xl border border-ink/10 bg-paper px-3 py-2.5 outline-none focus:ring-2 focus:ring-coral/40 dark:border-white/10 dark:bg-ink-soft"
          />
        </Field>

        <Field label="Modelo" hint="Puedes cambiarlo en cualquier momento. Haiku es más barato para pruebas.">
          <div className="grid gap-2">
            {MODELS.map((m) => (
              <Choice
                key={m.id}
                active={settings.model === m.id}
                title={m.label}
                hint={m.hint}
                onClick={() => void patchSettings({ model: m.id })}
              />
            ))}
          </div>
        </Field>

        <Field label="Tono de respuesta">
          <div className="grid gap-2 sm:grid-cols-2">
            {TONES.map((t) => (
              <Choice
                key={t.id}
                active={settings.tone === t.id}
                title={t.label}
                hint={t.hint}
                onClick={() => void patchSettings({ tone: t.id as Tone })}
              />
            ))}
          </div>
        </Field>

        <Field label="Idioma">
          <div className="flex gap-2">
            {(
              [
                ['es', 'Español'],
                ['en', 'English'],
              ] as [AppLanguage, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => void patchSettings({ language: id })}
                className={`rounded-xl px-4 py-2 text-sm ${
                  settings.language === id
                    ? 'bg-ink text-cream dark:bg-coral'
                    : 'border border-ink/10 dark:border-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Tema">
          <div className="flex gap-2">
            {(
              [
                ['light', 'Claro'],
                ['dark', 'Oscuro'],
                ['system', 'Sistema'],
              ] as [ThemeMode, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => void patchSettings({ theme: id })}
                className={`rounded-xl px-4 py-2 text-sm ${
                  settings.theme === id
                    ? 'bg-ink text-cream dark:bg-coral'
                    : 'border border-ink/10 dark:border-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        <Field
          label="Prompt coach"
          hint="Antes de llamar al modelo, MIMI sugiere una versión más clara de tu prompt."
        >
          <button
            onClick={() => void patchSettings({ coachEnabled: !settings.coachEnabled })}
            className={`rounded-xl px-4 py-2 text-sm ${
              settings.coachEnabled
                ? 'bg-coral text-white'
                : 'border border-ink/10 dark:border-white/10'
            }`}
          >
            {settings.coachEnabled ? 'Activado' : 'Desactivado'}
          </button>
        </Field>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="text-sm font-medium">{label}</h2>
      {hint && <p className="mb-2 mt-0.5 text-xs text-ink-muted">{hint}</p>}
      <div className={hint ? '' : 'mt-2'}>{children}</div>
    </section>
  )
}

function Choice({
  active,
  title,
  hint,
  onClick,
}: {
  active: boolean
  title: string
  hint: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-3 text-left ${
        active
          ? 'border-coral bg-blush/40 dark:bg-coral/10'
          : 'border-ink/10 hover:border-ink/20 dark:border-white/10'
      }`}
    >
      <p className="font-medium">{title}</p>
      <p className="text-xs text-ink-muted">{hint}</p>
    </button>
  )
}
