import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import type { AppUser } from '../lib/types'

const DEMO_KEY = 'mimi-demo-user'

type AuthContextValue = {
  user: AppUser | null
  loading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  continueDemo: (name?: string) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const isDemo = !isSupabaseConfigured()

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      localStorage.removeItem(DEMO_KEY)
      setUser(null)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user
      setUser(
        sessionUser
          ? {
              id: sessionUser.id,
              email: sessionUser.email ?? '',
              displayName:
                (sessionUser.user_metadata?.full_name as string | undefined) ??
                sessionUser.email?.split('@')[0] ??
                'Tú',
            }
          : null,
      )
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user
      setUser(
        sessionUser
          ? {
              id: sessionUser.id,
              email: sessionUser.email ?? '',
              displayName:
                (sessionUser.user_metadata?.full_name as string | undefined) ??
                sessionUser.email?.split('@')[0] ??
                'Tú',
            }
          : null,
      )
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase()
    if (!supabase) {
      const demo: AppUser = {
        id: 'demo-user',
        email,
        displayName: email.split('@')[0] || 'Demo',
      }
      localStorage.setItem(DEMO_KEY, JSON.stringify(demo))
      setUser(demo)
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const supabase = getSupabase()
    if (!supabase) {
      const demo: AppUser = {
        id: 'demo-user',
        email,
        displayName: name || email.split('@')[0] || 'Demo',
      }
      localStorage.setItem(DEMO_KEY, JSON.stringify(demo))
      setUser(demo)
      return
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) throw error
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) throw new Error('Google solo está disponible con Supabase')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app` },
    })
    if (error) throw error
  }, [])

  const continueDemo = useCallback((name?: string) => {
    const demo: AppUser = {
      id: 'demo-user',
      email: 'demo@mimi.ai',
      displayName: name || 'Demo',
    }
    localStorage.setItem(DEMO_KEY, JSON.stringify(demo))
    setUser(demo)
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabase()
    if (supabase) await supabase.auth.signOut()
    localStorage.removeItem(DEMO_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isDemo,
      signIn,
      signUp,
      signInWithGoogle,
      continueDemo,
      signOut,
    }),
    [user, loading, isDemo, signIn, signUp, signInWithGoogle, continueDemo, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
