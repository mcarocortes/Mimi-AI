import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-cream text-ink-muted">
        Cargando MIMI…
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}
