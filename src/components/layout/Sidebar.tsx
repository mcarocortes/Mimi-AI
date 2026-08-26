import { MessageSquare, Trash2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useChat } from '../../context/ChatContext'
import { useSettings } from '../../context/SettingsContext'
import { formatWhen } from '../../lib/utils'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { conversations, activeId, openConversation, removeConversation } = useChat()
  const { settings } = useSettings()

  return (
    <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
      {conversations.length === 0 && (
        <p className="px-3 py-6 text-sm text-cream/40">
          Aún no hay chats. Empieza uno — MIMI guarda el hilo.
        </p>
      )}
      <ul className="space-y-0.5">
        {conversations.map((c) => (
          <li key={c.id} className="group relative">
            <NavLink
              to={`/app/c/${c.id}`}
              onClick={() => {
                void openConversation(c.id)
                onNavigate?.()
              }}
              className={`flex items-start gap-2 rounded-lg px-3 py-2 pr-9 text-sm ${
                activeId === c.id ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
              <span className="min-w-0">
                <span className="block truncate">{c.title}</span>
                <span className="block text-[11px] text-cream/40">
                  {formatWhen(c.updatedAt, settings.language)}
                </span>
              </span>
            </NavLink>
            <button
              className="absolute right-2 top-2 rounded p-1 text-cream/30 opacity-0 hover:bg-white/10 hover:text-coral group-hover:opacity-100"
              aria-label="Borrar conversación"
              onClick={(e) => {
                e.preventDefault()
                if (confirm('¿Borrar esta conversación?')) void removeConversation(c.id)
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
