import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/brand/Logo'
import { MimiScene } from '../components/brand/MimiScene'

export function LoginPage() {
  const { signIn, signUp, signInWithGoogle, continueDemo, isDemo } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'up') await signUp(email, password, name)
      else await signIn(email, password)
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-cream text-ink">
      <section className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden brand-gradient text-cream">
        <div className="grain absolute inset-0 opacity-50 pointer-events-none" />
        <div className="relative flex items-center gap-2.5">
          <Logo className="h-11 w-11" />
          <span className="font-display text-2xl font-semibold tracking-tight">MIMI</span>
        </div>
        <div className="relative flex flex-1 items-center justify-center overflow-hidden py-6">
          <MimiScene
            size="hero"
            splineUrl="https://prod.spline.design/RqTMcMyg7pjNrJIA/scene.splinecode"
          />
        </div>
        <div className="relative max-w-md">
          <p className="font-display text-4xl font-semibold leading-[1.1] text-balance">
            No es otro chatbot.
            <span className="text-sand"> Es un coach de prompts.</span>
          </p>
          <p className="mt-4 text-cream/75 text-base leading-relaxed">
            Escribes «hazme un poema». MIMI te propone el prompt que de verdad
            querías — y luego responde.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <MimiScene size="md" className="mb-3" />
            <div className="flex items-center gap-2">
              <Logo className="h-10 w-10" />
              <span className="font-display text-2xl font-semibold">MIMI</span>
            </div>
          </div>
          <h1 className="font-display text-3xl font-semibold mb-1">
            {mode === 'in' ? 'Entra' : 'Crea tu cuenta'}
          </h1>
          <p className="text-ink-muted mb-8">
            {isDemo
              ? 'Modo demo: no hace falta backend. Tus chats viven en este navegador.'
              : 'Email y contraseña, o Google.'}
          </p>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === 'up' && (
              <label className="block">
                <span className="text-xs uppercase tracking-wide text-ink-muted">Nombre</span>
                <input
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-paper px-3 py-2.5 outline-none focus:ring-2 focus:ring-coral/40"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </label>
            )}
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-ink-muted">Email</span>
              <input
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-ink/10 bg-paper px-3 py-2.5 outline-none focus:ring-2 focus:ring-coral/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-ink-muted">Contraseña</span>
              <input
                type="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-xl border border-ink/10 bg-paper px-3 py-2.5 outline-none focus:ring-2 focus:ring-coral/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
              />
            </label>
            {error && (
              <p className="text-sm text-coral bg-coral/10 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-coral text-white py-3 font-medium hover:bg-coral-dark disabled:opacity-60"
            >
              {busy ? 'Un segundo…' : mode === 'in' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>

          {!isDemo && (
            <button
              type="button"
              onClick={() => signInWithGoogle().catch((err: Error) => setError(err.message))}
              className="mt-3 w-full rounded-xl border border-ink/15 py-3 font-medium hover:bg-cream-2"
            >
              Continuar con Google
            </button>
          )}

          {isDemo && (
            <button
              type="button"
              onClick={() => {
                continueDemo('Demo')
                navigate('/app')
              }}
              className="mt-3 w-full rounded-xl border border-ink/15 py-3 font-medium hover:bg-cream-2"
            >
              Saltar y entrar en demo
            </button>
          )}

          <p className="mt-6 text-sm text-ink-muted">
            {mode === 'in' ? '¿Sin cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              type="button"
              className="text-coral font-medium"
              onClick={() => setMode(mode === 'in' ? 'up' : 'in')}
            >
              {mode === 'in' ? 'Regístrate' : 'Entra'}
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}
