import { useRef } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import { SettingsProvider } from './context/SettingsContext'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ChatPage } from './pages/ChatPage'
import { LoginPage } from './pages/LoginPage'
import { SettingsPage } from './pages/SettingsPage'

function AppRoutes() {
  const { user, loading } = useAuth()
  const keepLoginAlive = useRef(false)
  if (!loading && !user) keepLoginAlive.current = true

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-cream text-ink-muted">
        Cargando MIMI…
      </div>
    )
  }

  return (
    <>
      {keepLoginAlive.current && (
        <div
          className={
            user
              ? 'invisible pointer-events-none fixed inset-0 -z-10'
              : undefined
          }
          inert={Boolean(user)}
          aria-hidden={Boolean(user)}
        >
          <LoginPage />
        </div>
      )}
      {user ? (
        <Routes>
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <SettingsProvider>
                  <ChatProvider>
                    <AppShell />
                  </ChatProvider>
                </SettingsProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<ChatPage />} />
            <Route path="c/:id" element={<ChatPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={null} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </>
  )
}

export default function App() {
  return <AppRoutes />
}
