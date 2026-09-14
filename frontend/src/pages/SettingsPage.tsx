import { useNavigate } from 'react-router-dom'
import {
  CheckIcon,
  ExternalLinkIcon,
  GithubIcon,
  LogOutIcon,
  ShieldCheckIcon,
  UserIcon,
} from '../components/Icons'
import { Button, Chip, Panel, PanelHeader } from '../components/ui'
import { displayName, useAuth } from '../contexts/AuthContext'
import { formatDateTime } from '../lib/utils'

function ReadOnlyField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[13px] font-medium text-fg-muted">{label}</p>
      <p className="mt-1 text-[14px] text-fg">
        {value ?? <span className="text-fg-faint">Not shared by GitHub</span>}
      </p>
    </div>
  )
}

export function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-[800px] px-5 py-8">
      <h1 className="text-[22px] font-bold tracking-tight text-fg">Settings</h1>
      <p className="mt-1 text-[14px] text-fg-muted">Your VisualMerge account.</p>

      <Panel className="mt-6">
        <PanelHeader
          icon={<UserIcon className="h-4.5 w-4.5 text-brand-400" />}
          title="Profile"
          subtitle="GitHub owns these details. Change them on GitHub and they update here on your next sign-in."
        />
        <div className="p-5">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 rounded-full border border-ink-700 object-cover"
              />
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-ink-700 bg-ink-800 text-fg-muted">
                <UserIcon className="h-6 w-6" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold text-fg">{displayName(user)}</p>
              {user.githubUsername && (
                <p className="truncate font-mono text-[13px] text-fg-muted">
                  @{user.githubUsername}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ReadOnlyField label="Name" value={user.name} />
            <ReadOnlyField label="Email" value={user.email} />
            <ReadOnlyField label="GitHub username" value={user.githubUsername} />
            <ReadOnlyField label="GitHub user ID" value={user.githubId} />
            <ReadOnlyField label="VisualMerge account ID" value={user.id} />
            <ReadOnlyField label="Member since" value={formatDateTime(user.createdAt)} />
          </div>
        </div>
      </Panel>

      <Panel className="mt-4">
        <PanelHeader
          icon={<GithubIcon className="h-4.5 w-4.5 text-fg-muted" />}
          title="GitHub connection"
          subtitle="How VisualMerge reaches your repositories and branches."
          actions={
            user.githubConnected ? (
              <Chip tone="merged">
                <CheckIcon className="h-3 w-3" strokeWidth={3} />
                Connected
              </Chip>
            ) : (
              <Chip tone="warn">Not connected</Chip>
            )
          }
        />
        <div className="space-y-3 p-5">
          <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-fg-muted">
            <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-merged" />
            Your GitHub access token is held on the VisualMerge server for the length of your
            session. It is never sent to the browser and never written to the database.
          </p>
          {user.githubUsername && (
            <a
              href={`https://github.com/${user.githubUsername}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-[13px] text-brand-400 transition hover:text-brand-500"
            >
              <ExternalLinkIcon className="h-3.5 w-3.5" />
              View your GitHub profile
            </a>
          )}
        </div>
      </Panel>

      <Panel className="mt-4">
        <PanelHeader title="Session" subtitle="Sign out of VisualMerge on this device." />
        <div className="p-5">
          <Button variant="danger" onClick={() => void handleLogout()}>
            <LogOutIcon className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </Panel>
    </div>
  )
}
