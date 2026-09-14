import { Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { AppLayout } from './layouts/AppLayout'
import { PublicLayout } from './layouts/PublicLayout'

import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { MergeSessionPage } from './pages/MergeSessionPage'
import { NewMergePage } from './pages/NewMergePage'
import { RepositoriesPage } from './pages/RepositoriesPage'
import { SettingsPage } from './pages/SettingsPage'

/**
 * The landing page is the only screen with scroll choreography, and GSAP is the
 * single largest thing the frontend depends on. Splitting it out keeps it off
 * every authenticated route, where nothing animates and a signed-in user goes
 * straight to the dashboard.
 */
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })),
)

/** Blank while the session is being checked, so no page flashes the wrong state. */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <PublicLayout>
              <Suspense fallback={null}>
                <LandingPage />
              </Suspense>
            </PublicLayout>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      {/* GitHub is the only way in, so registering is the same door. */}
      <Route path="/register" element={<Navigate to="/login" replace />} />

      {/* ── Authenticated ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/repositories"
        element={
          <ProtectedRoute>
            <RepositoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/merge/new"
        element={
          <ProtectedRoute>
            <NewMergePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/merge/:sessionId"
        element={
          <ProtectedRoute>
            <MergeSessionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
