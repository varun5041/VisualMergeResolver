import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BranchBadge } from '../components/BranchBadge'
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  FolderIcon,
  GitBranchIcon,
  GitMergeIcon,
  PlusIcon,
  ShieldCheckIcon,
  SparkIcon,
} from '../components/Icons'
import { Button, Chip, Panel } from '../components/ui'
import { cn } from '../lib/utils'
import { api } from '../services/api'
import { useFlow } from '../state/FlowContext'


/* ── Stats card ── */
function StatCard({ label, value, icon: Icon, tone }: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  tone: 'brand' | 'merged' | 'warn' | 'neutral'
}) {
  return (
    <Panel className="p-4 transition hover:border-ink-600">
      <div className="flex items-center justify-between">
        <div className={cn(
          'grid h-9 w-9 place-items-center rounded-lg border',
          tone === 'brand' && 'border-brand-400/25 bg-brand-400/10 text-brand-400',
          tone === 'merged' && 'border-merged/25 bg-merged/10 text-merged',
          tone === 'warn' && 'border-warn/25 bg-warn/10 text-warn',
          tone === 'neutral' && 'border-ink-600 bg-ink-800 text-fg-muted',
        )}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className="mt-3 font-mono text-[22px] font-semibold text-fg">{value}</p>
      <p className="mt-1 text-[12.5px] text-fg-faint">{label}</p>
    </Panel>
  )
}

/* ── Empty state ── */
function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-700 bg-ink-900/30 px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl border border-ink-700 bg-ink-850/60 text-fg-muted">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-fg">{title}</h3>
      <p className="mt-2 max-w-[320px] text-[13px] text-fg-muted">{description}</p>
      <Button variant="primary" className="mt-5" onClick={onAction}>
        <PlusIcon className="h-4 w-4" />
        {actionLabel}
      </Button>
    </div>
  )
}

/* ── Session status badge ── */
function SessionStatus({ status }: { status: string }) {
  const map: Record<string, { tone: 'merged' | 'warn' | 'danger' | 'brand' | 'neutral'; label: string }> = {
    resolved: { tone: 'merged', label: 'Resolved' },
    'ready-to-resolve': { tone: 'warn', label: 'Ready to resolve' },
    analyzing: { tone: 'brand', label: 'Analyzing' },
    draft: { tone: 'neutral', label: 'Draft' },
  }
  const { tone, label } = map[status] ?? { tone: 'neutral' as const, label: status }
  return <Chip tone={tone}>{label}</Chip>
}

/* ── Mock session data ── */
const recentSessions = [
  {
    id: 'session-1',
    repo: 'causekind/causekind-web',
    branchA: 'feature/ganpati',
    branchB: 'feature/donation-flow',
    conflicts: 2,
    status: 'ready-to-resolve',
    updatedAt: '2 min ago',
  },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const { setProject, reset } = useFlow()


  useEffect(() => {
    let cancelled = false
    api.getProjects().then((projects) => {
      if (!cancelled && projects[0]) setProject(projects[0])
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startComparison = () => {
    reset()
    navigate('/analyzing')
  }

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-8">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Merge Sessions" value="1" icon={GitMergeIcon} tone="brand" />
        <StatCard label="Repositories" value="1" icon={FolderIcon} tone="neutral" />
        <StatCard label="Conflicts Resolved" value="0" icon={ShieldCheckIcon} tone="merged" />
        <StatCard label="Successful Merges" value="0" icon={CheckIcon} tone="merged" />
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate('/connect')}
          className={cn(
            'group rounded-xl border border-merged/30 bg-merged/6 p-5 text-left transition',
            'hover:-translate-y-0.5 hover:border-merged/50 hover:bg-merged/10',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-merged/30 bg-merged/10 text-merged">
                <GitBranchIcon className="h-4 w-4" />
              </span>
              <span className="text-[15px] font-semibold text-fg">Connect Repository</span>
            </span>
            <Chip tone="merged">Live</Chip>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">
            Connect a public GitHub repository. VisualMerge clones it into an isolated workspace.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-merged">
            Connect Repository
            <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </button>

        <button
          type="button"
          onClick={startComparison}
          className={cn(
            'group rounded-xl border border-brand-400/30 bg-brand-400/6 p-5 text-left transition',
            'hover:-translate-y-0.5 hover:border-brand-400/50 hover:bg-brand-400/10',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-brand-400/30 bg-brand-400/10 text-brand-400">
                <SparkIcon className="h-4 w-4" />
              </span>
              <span className="text-[15px] font-semibold text-fg">Try Demo Mode</span>
            </span>
            <Chip tone="warn">Mock data</Chip>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">
            Experience the full VisualMerge workflow with built-in sample data.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-400">
            Start Demo
            <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </button>
      </div>

      {/* Recent sessions */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-fg">Recent merge sessions</h2>
          <Button size="sm" onClick={() => navigate('/merge/new')}>
            <PlusIcon className="h-3.5 w-3.5" />
            New merge
          </Button>
        </div>

        {recentSessions.length > 0 ? (
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <Panel
                key={session.id}
                className="flex flex-wrap items-center gap-4 px-5 py-3.5 transition hover:border-ink-600 cursor-pointer"
                onClick={startComparison}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-medium text-fg">{session.repo}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <BranchBadge name={session.branchA} tone="a" size="sm" />
                    <span className="text-[11px] text-fg-faint">↔</span>
                    <BranchBadge name={session.branchB} tone="b" size="sm" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Chip tone="danger">{session.conflicts} conflicts</Chip>
                  <SessionStatus status={session.status} />
                  <span className="flex items-center gap-1.5 text-[12px] text-fg-faint">
                    <ClockIcon className="h-3 w-3" />
                    {session.updatedAt}
                  </span>
                  <ArrowRightIcon className="h-4 w-4 text-fg-faint" />
                </div>
              </Panel>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={GitMergeIcon}
            title="No merge sessions yet"
            description="Create a session to compare two branches visually."
            actionLabel="New merge"
            onAction={() => navigate('/merge/new')}
          />
        )}
      </div>
    </div>
  )
}
