import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError } from '../services/http'
import { GITHUB_LOGIN_URL, authApi } from '../services/visualMergeApi'
import type { AuthenticatedUser } from '../types/api'

interface AuthContextValue {
  user: AuthenticatedUser | null
  isAuthenticated: boolean
  isLoading: boolean
  /** Set when the session could not be checked at all (backend down). */
  error: ApiError | null
  loginWithGitHub: () => void
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  /**
   * GET /api/auth/me is the only source of identity. A 401 simply means
   * "signed out"; anything else is a real failure worth showing.
   */
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const me = await authApi.me(signal)
      setUser(me)
      setError(null)
    } catch (failure) {
      if (signal?.aborted) return
      setUser(null)
      setError(failure instanceof ApiError && failure.status === 401 ? null : (failure as ApiError))
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  const loginWithGitHub = useCallback(() => {
    // A full navigation, not a fetch: GitHub's consent screen refuses to be
    // framed or XHR'd, and the session cookie has to be set by the backend.
    window.location.href = GITHUB_LOGIN_URL
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      // The local session is gone either way; keeping a stale user on screen
      // after a failed logout would be worse than signing out optimistically.
      setUser(null)
    }
  }, [])

  const refresh = useCallback(() => load(), [load])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      error,
      loginWithGitHub,
      logout,
      refresh,
    }),
    [user, isLoading, error, loginWithGitHub, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}

/** The label to show for an account, without ever inventing one. */
export function displayName(user: AuthenticatedUser | null): string {
  if (!user) return ''
  return user.name?.trim() || user.githubUsername || 'GitHub user'
}
