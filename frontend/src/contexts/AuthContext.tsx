import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '../services/api' // We will use a fetch wrapper, but we can also use plain fetch

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  githubConnected: boolean
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGitHub: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (patch: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch session on mount
  useEffect(() => {
    fetch('http://localhost:8080/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then((data) => {
        setUser(data as User)
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const login = useCallback(async (email: string, _password: string) => {
    // Basic email login is not fully implemented in backend yet, keeping placeholder logic for UI testing
    const newUser: User = {
      id: crypto.randomUUID(),
      name: email.split('@')[0] ?? 'Developer',
      email,
      githubConnected: false,
    }
    setUser(newUser)
  }, [])

  const loginWithGitHub = useCallback(async () => {
    // Redirect to Spring Boot OAuth2 authorization endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/github'
  }, [])

  const register = useCallback(async (name: string, email: string, _password: string) => {
    // Basic email register is not fully implemented in backend yet
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      githubConnected: false,
    }
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    fetch('http://localhost:8080/api/auth/logout', { method: 'POST', credentials: 'include' })
      .then(() => {
        setUser(null)
      })
      .catch(() => {
        setUser(null)
      })
  }, [])

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      return { ...prev, ...patch }
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      loginWithGitHub,
      register,
      logout,
      updateUser,
    }),
    [user, isLoading, login, loginWithGitHub, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
