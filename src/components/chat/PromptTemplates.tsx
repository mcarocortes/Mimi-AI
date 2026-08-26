import { TEMPLATES } from '../../lib/templates'

export function PromptTemplates() {
  const categories = [...new Set(TEMPLATES.map((t) => t.category))]

  function apply(prompt: string) {
    window.dispatchEvent(new CustomEvent('mimi:template', { detail: prompt }))
  }

  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <section key={cat}>
          <h3 className="mb-2 text-xs uppercase tracking-wider text-ink-muted">{cat}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {TEMPLATES.filter((t) => t.category === cat).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => apply(t.prompt)}
                className="rounded-2xl border border-ink/10 bg-paper p-4 text-left transition hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-sm dark:border-white/10 dark:bg-ink-soft"
              >
                <p className="font-medium">{t.title}</p>
                <p className="mt-1 text-sm text-ink-muted">{t.description}</p>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
