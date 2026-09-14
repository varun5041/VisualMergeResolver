import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { VisualMergeMark } from '../components/Logo'
import {
  FolderIcon,
  GitMergeIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  PlusIcon,
  SettingsIcon,
  UserIcon,
} from '../components/Icons'
import { cn } from '../lib/utils'
import { displayName, useAuth } from '../contexts/AuthContext'

const sidebarNav = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
  { id: 'repositories', label: 'Repositories', icon: FolderIcon, path: '/repositories' },
  { id: 'merge-sessions', label: 'Merge Sessions', icon: GitMergeIcon, path: '/merge/new' },
]

const workspaceNav = [{ id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' }]

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  const signOut = async () => {
    await logout()
    navigate('/')
  }

  const name = displayName(user)

  const sidebarContent = (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-ink-800 px-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5"
          onClick={() => setSidebarOpen(false)}
        >
          <VisualMergeMark size={26} />
          <span className="text-[14px] font-semibold tracking-tight text-fg">VisualMerge</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-slim">
        <div className="space-y-0.5">
          {sidebarNav.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition',
                isActive(item.path)
                  ? 'bg-brand-500/12 font-medium text-fg'
                  : 'text-fg-muted hover:bg-ink-800 hover:text-fg',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-fg-faint uppercase">
            Workspace
          </p>
          <div className="space-y-0.5">
            {workspaceNav.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition',
                  isActive(item.path)
                    ? 'bg-brand-500/12 font-medium text-fg'
                    : 'text-fg-muted hover:bg-ink-800 hover:text-fg',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* The signed-in account, straight from GET /api/auth/me. */}
      <div className="shrink-0 border-t border-ink-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full border border-ink-700 object-cover"
            />
          ) : (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-400">
              <UserIcon className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-fg">{name}</p>
            {user?.githubUsername && (
              <p className="truncate font-mono text-[11px] text-fg-faint">@{user.githubUsername}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-fg-faint transition hover:bg-ink-800 hover:text-fg-muted"
            title="Sign out"
          >
            <LogOutIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-ink-950">
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-ink-800 bg-ink-900/60 lg:flex">
        {sidebarContent}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex w-[260px] flex-col bg-ink-900 shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-ink-800 bg-ink-950/60 px-5 backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg text-fg-muted transition hover:bg-ink-800 hover:text-fg lg:hidden"
              aria-label="Open menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <h2 className="truncate text-[15px] text-fg-muted">
              {greeting}
              {name && (
                <>
                  , <span className="font-medium text-fg">{name}</span>
                </>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/merge/new')}
            className={cn(
              'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-4 text-[13.5px] font-medium transition',
              'bg-brand-500 text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_6px_18px_-8px_rgba(91,131,240,0.8)]',
              'hover:bg-brand-400',
            )}
          >
            <PlusIcon className="h-4 w-4" />
            New merge
          </button>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-slim">
          <div className="app-grid-bg min-h-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
