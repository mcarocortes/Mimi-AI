import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as db from '../lib/db'
import { DEFAULT_SETTINGS, type UserSettings } from '../lib/types'
import { useAuth } from './AuthContext'

type SettingsContextValue = {
  settings: UserSettings
  setSettings: (next: UserSettings) => Promise<void>
  patchSettings: (patch: Partial<UserSettings>) => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function applyTheme(theme: UserSettings['theme']) {
  const dark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? '#000000' : '#e85002')
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettingsState] = useState<UserSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    if (!user) return
    db.getSettings(user.id).then((loaded) => {
      const next = {
        ...loaded,
        displayName: loaded.displayName || user.displayName,
      }
      setSettingsState(next)
      applyTheme(next.theme)
    })
  }, [user])

  useEffect(() => {
    applyTheme(settings.theme)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme(settings.theme)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [settings.theme])

  const setSettings = useCallback(
    async (next: UserSettings) => {
      setSettingsState(next)
      applyTheme(next.theme)
      if (user) await db.saveSettings(user.id, next)
    },
    [user],
  )

  const patchSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      const next = { ...settings, ...patch }
      await setSettings(next)
    },
    [settings, setSettings],
  )

  const value = useMemo(
    () => ({ settings, setSettings, patchSettings }),
    [settings, setSettings, patchSettings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
