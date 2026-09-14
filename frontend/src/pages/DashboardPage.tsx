import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BranchBadge } from '../components/BranchBadge'
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  FolderIcon,
  GitMergeIcon,
  PlusIcon,
  ShieldCheckIcon,
} from '../components/Icons'
import { EmptyState, ErrorState, LoadingRows, Skeleton } from '../components/states'
import { MergeSessionStatusChip } from '../components/MergeSessionStatusChip'
import { Button, Panel } from '../components/ui'
import { useAsync } from '../lib/useAsync'
import { cn, formatRelativeTime } from '../lib/utils'
import { githubApi, mergeSessionApi } from '../services/visualMergeApi'

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  loading,
}: {
  label: string
  value: number | null
  icon: React.ComponentType<{ className?: string }>
  tone: 'brand' | 'merged' | 'neutral'
  loading: boolean
}) {
  return (
    <Panel className="p-4 transition hover:border-ink-600">
      <div
        className={cn(
          'grid h-9 w-9 place-items-center rounded-lg border',
          tone === 'brand' && 'border-brand-400/25 bg-brand-400/10 text-brand-400',
          tone === 'merged' && 'border-merged/25 bg-merged/10 text-merged',
          tone === 'neutral' && 'border-ink-600 bg-ink-800 text-fg-muted',
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-[26px] w-12" />
      ) : (
        <p className="mt-3 font-mono text-[22px] font-semibold text-fg">{value ?? '-'}</p>
      )}
      <p className="mt-1 text-[12.5px] text-fg-faint">{label}</p>
    </Panel>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()

  const stats = useAsync((signal) => mergeSessionApi.stats(signal), [])
  const sessions = useAsync((signal) => mergeSessionApi.list(signal), [])
  // The repository count comes from GitHub, which is the authority on what
  // this account can reach. A GitHub outage must not take the rest down.
  const repositories = useAsync((signal) => githubApi.repositories(signal), [])

  const reloadAll = useCallback(() => {
    stats.reload()
    sessions.reload()
    repositories.reload()
  }, [stats, sessions, repositories])

  const newMerge = () => navigate('/merge/new')

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-fg">Dashboard</h1>
          <p className="mt-1 text-[14px] text-fg-muted">
            Your GitHub repositories and every merge session you have created.
          </p>
        </div>
        <Button variant="primary" onClick={newMerge}>
          <PlusIcon className="h-4 w-4" />
          New merge
        </Button>
      </div>

      {/* ── Stats: real counts, zero when nothing has happened yet ── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Merge sessions"
          value={stats.data?.totalSessions ?? null}
          icon={GitMergeIcon}
          tone="brand"
          loading={stats.isLoading}
        />
        <StatCard
          label="Repositories on GitHub"
          value={repositories.data?.length ?? null}
          icon={FolderIcon}
          tone="neutral"
          loading={repositories.isLoading}
        />
        <StatCard
          label="Conflicts resolved"
          value={stats.data?.conflictsResolved ?? null}
          icon={ShieldCheckIcon}
          tone="merged"
          loading={stats.isLoading}
        />
        <StatCard
          label="Completed merges"
          value={stats.data?.completedMerges ?? null}
          icon={CheckIcon}
          tone="merged"
          loading={stats.isLoading}
        />
      </div>

      {stats.status === 'error' && stats.error && (
        <ErrorState className="mt-4" error={stats.error} onRetry={reloadAll} />
      )}
      {repositories.status === 'error' && repositories.error && stats.status !== 'error' && (
        <ErrorState
          className="mt-4"
          error={repositories.error}
          onRetry={() => repositories.reload()}
        />
      )}

      {/* ── Merge sessions ── */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-fg">Recent merge sessions</h2>
          {(sessions.data?.length ?? 0) > 0 && (
            <Button size="sm" onClick={newMerge}>
              <PlusIcon className="h-3.5 w-3.5" />
              New merge
            </Button>
          )}
        </div>

        {sessions.isLoading && <LoadingRows rows={2} />}

        {sessions.status === 'error' && sessions.error && (
          <ErrorState error={sessions.error} onRetry={() => sessions.reload()} />
        )}

        {sessions.status === 'success' && sessions.data?.length === 0 && (
          <EmptyState
            icon={GitMergeIcon}
            title="No merge sessions yet"
            description="Create a merge session by selecting a repository and two branches."
            action={
              <Button variant="primary" onClick={newMerge}>
                <PlusIcon className="h-4 w-4" />
                New merge
              </Button>
            }
          />
        )}

        {sessions.status === 'success' && (sessions.data?.length ?? 0) > 0 && (
          <div className="space-y-2">
            {sessions.data!.map((session) => {
              const updated = formatRelativeTime(session.updatedAt)
              return (
                <Panel
                  key={session.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/merge/${session.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      navigate(`/merge/${session.id}`)
                    }
                  }}
                  className="flex cursor-pointer flex-wrap items-center gap-4 px-5 py-3.5 transition hover:border-ink-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[13px] font-medium text-fg">
                      {session.repository.fullName}
                    </span>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <BranchBadge name={session.branchA} tone="a" size="sm" />
                      <span className="text-[11px] text-fg-faint">↔</span>
                      <BranchBadge name={session.branchB} tone="b" size="sm" />
                      <span className="text-[11px] text-fg-faint">into</span>
                      <BranchBadge name={session.baseBranch} tone="base" size="sm" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MergeSessionStatusChip status={session.status} />
                    {updated && (
                      <span className="flex items-center gap-1.5 text-[12px] text-fg-faint">
                        <ClockIcon className="h-3 w-3" />
                        {updated}
                      </span>
                    )}
                    <ArrowRightIcon className="h-4 w-4 text-fg-faint" />
                  </div>
                </Panel>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
