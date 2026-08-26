import { BarChart3, Menu, Plus, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { Logo } from '../brand/Logo'
import { Sidebar } from '../layout/Sidebar'
import { InstallPrompt } from '../pwa/InstallPrompt'

export function AppShell() {
  const [open, setOpen] = useState(false)
  const { user, signOut, isDemo } = useAuth()
  const { openConversation } = useChat()
  const navigate = useNavigate()

  function newChat() {
    void openConversation(null)
    navigate('/app')
    setOpen(false)
  }

  return (
    <div className="h-dvh flex bg-cream text-ink dark:bg-black dark:text-cream overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[18.5rem] transform flex-col bg-ink text-cream transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between px-3">
          <div className="flex min-w-0 items-center gap-2">
            <Logo className="h-9 w-9 shrink-0" />
            <span className="font-display text-xl font-semibold tracking-tight">MIMI</span>
          </div>
          <button className="lg:hidden p-2" onClick={() => setOpen(false)} aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={newChat}
          className="mx-3 mb-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-xl bg-coral py-2.5 text-sm font-medium text-white hover:bg-coral-dark"
        >
          <Plus className="h-4 w-4" />
          Nueva conversación
        </button>
        <Sidebar onNavigate={() => setOpen(false)} />
        <div className="border-t border-white/10 p-3 space-y-1">
          <NavLink
            to="/app/analytics"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                isActive ? 'bg-white/10' : 'hover:bg-white/5'
              }`
            }
          >
            <BarChart3 className="h-4 w-4" />
            Analítica
          </NavLink>
          <NavLink
            to="/app/settings"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                isActive ? 'bg-white/10' : 'hover:bg-white/5'
              }`
            }
          >
            <Settings className="h-4 w-4" />
            Ajustes
          </NavLink>
          <div className="flex items-center justify-between px-3 pt-2 text-xs text-cream/50">
            <span className="truncate">{user?.displayName || user?.email}</span>
            <button onClick={() => void signOut()} className="hover:text-cream">
              Salir
            </button>
          </div>
          {isDemo && (
            <p className="px-3 pt-1 text-[11px] text-gold">Modo demo · datos locales</p>
          )}
        </div>
      </aside>

      {open && (
        <button
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b border-ink/10 px-3 dark:border-white/10 lg:hidden">
          <button onClick={() => setOpen(true)} className="p-2" aria-label="Menú">
            <Menu className="h-5 w-5" />
          </button>
          <Logo className="h-8 w-8 shrink-0" />
          <span className="font-display text-lg">MIMI</span>
        </header>
        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
        <InstallPrompt />
      </div>
    </div>
  )
}
