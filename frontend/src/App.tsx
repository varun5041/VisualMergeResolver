import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { PublicLayout } from './layouts/PublicLayout'
import { AppLayout } from './layouts/AppLayout'
import { FlowProvider } from './state/FlowContext'

// Public pages
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

// Authenticated pages
import { DashboardPage } from './pages/DashboardPage'
import { RepositoriesPage } from './pages/RepositoriesPage'
import { NewMergePage } from './pages/NewMergePage'
import { SettingsPage } from './pages/SettingsPage'

// Existing merge flow pages (preserved exactly as-is)
import { ConnectRepository } from './pages/ConnectRepository'
import { Analyzing } from './pages/Analyzing'
import { ConflictOverview } from './pages/ConflictOverview'
import { ConflictResolver } from './pages/ConflictResolver'
import { MergeResultPage } from './pages/MergeResultPage'

/** Redirects unauthenticated users to login. */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** Redirects authenticated users away from public auth pages. */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <PublicLayout>
              <LandingPage />
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
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* ── Authenticated routes ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <FlowProvider>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </FlowProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/repositories"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RepositoriesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/merge/new"
        element={
          <ProtectedRoute>
            <FlowProvider>
              <AppLayout>
                <NewMergePage />
              </AppLayout>
            </FlowProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Existing merge flow routes (preserved) ── */}
      <Route
        path="/connect"
        element={
          <ProtectedRoute>
            <FlowProvider>
              <AppLayout>
                <ConnectRepository />
              </AppLayout>
            </FlowProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyzing"
        element={
          <ProtectedRoute>
            <FlowProvider>
              <AppLayout>
                <Analyzing />
              </AppLayout>
            </FlowProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/conflicts"
        element={
          <ProtectedRoute>
            <FlowProvider>
              <AppLayout>
                <ConflictOverview />
              </AppLayout>
            </FlowProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resolve"
        element={
          <ProtectedRoute>
            <FlowProvider>
              <AppLayout>
                <ConflictResolver />
              </AppLayout>
            </FlowProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/merge"
        element={
          <ProtectedRoute>
            <FlowProvider>
              <AppLayout>
                <MergeResultPage />
              </AppLayout>
            </FlowProvider>
          </ProtectedRoute>
        }
      />

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
