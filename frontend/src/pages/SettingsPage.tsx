import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckIcon,
  GithubIcon,
  KeyIcon,
  LogOutIcon,
  MailIcon,
  ShieldCheckIcon,
  UserIcon,
} from '../components/Icons'
import { Button, Chip, Panel, PanelHeader } from '../components/ui'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name ?? '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateUser({ name })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-[800px] px-5 py-8">
      <h1 className="text-[22px] font-bold tracking-tight text-fg">Settings</h1>
      <p className="mt-1 text-[14px] text-fg-muted">Manage your account and preferences.</p>

      {/* Profile */}
      <Panel className="mt-6">
        <PanelHeader
          icon={<UserIcon className="h-4.5 w-4.5 text-brand-400" />}
          title="Profile"
          subtitle="Your account information."
        />
        <div className="space-y-4 p-5">
          <div>
            <label htmlFor="settings-name" className="mb-1.5 block text-[13px] font-medium text-fg-muted">
              Name
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                'h-10 w-full max-w-[400px] rounded-lg border border-ink-600 bg-ink-900 px-3',
                'text-[14px] text-fg placeholder:text-fg-faint',
                'transition outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
              )}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-fg-muted">Email</label>
            <div className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 text-fg-faint" />
              <span className="text-[14px] text-fg">{user?.email ?? 'Not set'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="primary" onClick={handleSave}>
              {saved ? (
                <>
                  <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
                  Saved
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </div>
      </Panel>

      {/* GitHub */}
      <Panel className="mt-5">
        <PanelHeader
          icon={<GithubIcon className="h-4.5 w-4.5 text-fg-muted" />}
          title="GitHub Connection"
          subtitle="Connect your GitHub account for repository access."
        />
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            {user?.githubConnected ? (
              <Chip tone="merged">
                <CheckIcon className="h-3 w-3" strokeWidth={3} />
                Connected
              </Chip>
            ) : (
              <Chip tone="neutral">Not connected</Chip>
            )}
            <span className="text-[13px] text-fg-muted">
              {user?.githubConnected ? 'Your GitHub account is linked.' : 'Connect to access private repositories.'}
            </span>
          </div>
          <Button size="sm" disabled={user?.githubConnected}>
            <GithubIcon className="h-4 w-4" />
            {user?.githubConnected ? 'Connected' : 'Connect GitHub'}
          </Button>
        </div>
      </Panel>

      {/* Security */}
      <Panel className="mt-5">
        <PanelHeader
          icon={<ShieldCheckIcon className="h-4.5 w-4.5 text-fg-muted" />}
          title="Security"
          subtitle="Manage your security settings."
        />
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <KeyIcon className="h-4 w-4 text-fg-faint" />
              <div>
                <p className="text-[13px] font-medium text-fg">Password</p>
                <p className="text-[12px] text-fg-faint">Change your account password</p>
              </div>
            </div>
            <Button size="sm" disabled>Change password</Button>
          </div>
        </div>
      </Panel>

      {/* Danger zone */}
      <Panel className="mt-5 border-danger/20">
        <PanelHeader
          icon={<LogOutIcon className="h-4.5 w-4.5 text-danger" />}
          title="Danger zone"
          subtitle="Irreversible actions."
        />
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-fg">Sign out</p>
              <p className="text-[12px] text-fg-faint">End your current session</p>
            </div>
            <Button size="sm" variant="danger" onClick={handleLogout}>
              <LogOutIcon className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  )
}
