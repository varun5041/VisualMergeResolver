import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { BranchSelect } from '../components/BranchSelect'
import {
  AlertIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  GitMergeIcon,
  LayersIcon,
  LockIcon,
  ShieldCheckIcon,
} from '../components/Icons'
import { Button, Chip, Mono, Panel, PanelHeader } from '../components/ui'
import { cn } from '../lib/utils'
import { repositoryApi } from '../services/repositoryApi'
import type { BranchSelection, GitRepository } from '../types/repository'
import { RepositoryError } from '../types/repository'

const STORAGE_KEY = 'visualmerge.repository'

type Stage = 'idle' | 'connecting' | 'connected'

/** Longer-running clone feedback, so the wait never looks like a hang. */
const CONNECT_STEPS = [
  'Validating repository URL...',
  'Contacting GitHub...',
  'Cloning into an isolated workspace...',
  'Discovering branches...',
]

function pickDefaultSelection(repository: GitRepository): BranchSelection {
  const names = repository.branches.map((branch) => branch.name)
  const base = repository.defaultBranch
  const others = names.filter((name) => name !== base)
  return {
    base,
    branchA: others[0] ?? base,
    branchB: others[1] ?? others[0] ?? base,
  }
}

export function ConnectRepository() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [repository, setRepository] = useState<GitRepository | null>(null)
  const [selection, setSelection] = useState<BranchSelection | null>(null)
  const [error, setError] = useState<RepositoryError | null>(null)
  const [restoring, setRestoring] = useState(true)

  // Re-attach to a repository connected earlier in this browser session.
  useEffect(() => {
    const storedId = sessionStorage.getItem(STORAGE_KEY)
    if (!storedId) {
      setRestoring(false)
      return
    }
    let cancelled = false
    repositoryApi
      .get(storedId)
      .then((found) => {
        if (cancelled) return
        setRepository(found)
        setSelection(pickDefaultSelection(found))
        setUrl(found.webUrl)
        setStage('connected')
      })
      .catch(() => {
        // The workspace is gone (backend restarted, or session expired).
        sessionStorage.removeItem(STORAGE_KEY)
      })
      .finally(() => {
        if (!cancelled) setRestoring(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Advance the clone progress labels while the request is in flight.
  useEffect(() => {
    if (stage !== 'connecting') return
    setProgress(0)
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(current + 1, CONNECT_STEPS.length - 1))
    }, 900)
    return () => window.clearInterval(timer)
  }, [stage])

  const connect = useCallback(async () => {
    setError(null)
    setStage('connecting')
    try {
      const connected = await repositoryApi.connect(url)
      sessionStorage.setItem(STORAGE_KEY, connected.id)
      setRepository(connected)
      setSelection(pickDefaultSelection(connected))
      setStage('connected')
    } catch (failure) {
      setError(
        failure instanceof RepositoryError
          ? failure
          : new RepositoryError('CLONE_FAILED', 'Something went wrong connecting that repository.'),
      )
      setStage('idle')
    }
  }, [url])

  const disconnect = useCallback(async () => {
    let cleanupFailure: RepositoryError | null = null
    if (repository) {
      try {
        await repositoryApi.disconnect(repository.id)
      } catch (failure) {
        // Reset the UI either way, but never hide a workspace that was not freed.
        cleanupFailure =
          failure instanceof RepositoryError
            ? failure
            : new RepositoryError('WORKSPACE_ERROR', 'The temporary workspace may not have been removed.')
      }
    }
    sessionStorage.removeItem(STORAGE_KEY)
    setRepository(null)
    setSelection(null)
    setStage('idle')
    setError(cleanupFailure)
  }, [repository])

  const selectionProblem = useMemo(() => {
    if (!selection) return null
    if (selection.branchA === selection.branchB) {
      return 'Branch A and Branch B must be different branches.'
    }
    if (selection.branchA === selection.base || selection.branchB === selection.base) {
      return 'Branch A and Branch B should both differ from the base branch.'
    }
    return null
  }, [selection])

  const singleBranch = repository !== null && repository.branches.length < 2

  return (
    <AppShell repositoryLabel={repository?.fullName ?? null}>
      <div className="mx-auto max-w-[900px]">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] text-fg-faint transition hover:text-fg-muted"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to start
        </button>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[26px] leading-none font-semibold tracking-tight text-fg">
                Connect Repository
              </h1>
              <Chip tone="merged">Real repository</Chip>
            </div>
            <p className="mt-3 text-[14px] text-fg-muted">
              VisualMerge clones a public GitHub repository into an isolated workspace and reads its
              real branches. Your repository is only ever read — nothing is pushed or modified.
            </p>
          </div>
        </div>

        {/* ---------------- URL input ---------------- */}
        <Panel className="mt-6">
          <PanelHeader
            icon={<GitBranchIcon className="h-4.5 w-4.5 text-brand-400" />}
            title="Repository URL"
            subtitle="Public GitHub repositories. Private repositories need authentication, which is not available yet."
          />
          <div className="p-5">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (url.trim() && stage !== 'connecting') connect()
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <LockIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fg-faint" />
                <input
                  type="text"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  disabled={stage === 'connecting' || stage === 'connected'}
                  placeholder="https://github.com/username/project"
                  spellCheck={false}
                  autoComplete="off"
                  className={cn(
                    'h-11 w-full rounded-lg border border-ink-600 bg-ink-950 pr-3 pl-9',
                    'font-mono text-[13.5px] text-fg placeholder:text-fg-faint',
                    'transition outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
                    'disabled:opacity-60',
                  )}
                />
              </div>
              {stage === 'connected' ? (
                <Button type="button" size="lg" onClick={disconnect}>
                  Disconnect
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!url.trim() || stage === 'connecting'}
                >
                  {stage === 'connecting' ? 'Connecting…' : 'Connect Repository'}
                  {stage === 'connecting' ? null : <ArrowRightIcon className="h-4 w-4" />}
                </Button>
              )}
            </form>

            {stage === 'idle' && !error ? (
              <p className="mt-3 text-[12.5px] text-fg-faint">
                Try <Mono className="text-fg-muted">https://github.com/octocat/Hello-World</Mono>
              </p>
            ) : null}

            {/* Clone progress */}
            {stage === 'connecting' ? (
              <ul className="mt-4 space-y-2">
                {CONNECT_STEPS.map((step, index) => {
                  const done = index < progress
                  const running = index === progress
                  return (
                    <li
                      key={step}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border px-4 py-2.5 text-[13px] transition',
                        done && 'border-merged/20 bg-merged/6 text-fg-muted',
                        running && 'border-brand-400/30 bg-brand-400/8 text-fg',
                        !done && !running && 'border-ink-800 text-fg-faint opacity-40',
                      )}
                    >
                      {done ? (
                        <CheckIcon className="h-3.5 w-3.5 text-merged" strokeWidth={3} />
                      ) : running ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-brand-400 border-t-transparent" />
                      ) : (
                        <span className="h-1 w-1 rounded-full bg-current" />
                      )}
                      {step}
                    </li>
                  )
                })}
              </ul>
            ) : null}

            {/* Real failure — never a fabricated success */}
            {error ? (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/8 p-4">
                <AlertIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-danger" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13.5px] font-semibold text-fg">
                      {error.code === 'WORKSPACE_ERROR'
                        ? 'Workspace cleanup may not have completed'
                        : 'Could not connect'}
                    </p>
                    <Chip tone="danger">{error.code}</Chip>
                  </div>
                  <p className="mt-1.5 text-[13px] text-fg-muted">{error.message}</p>
                </div>
              </div>
            ) : null}

            {restoring && stage === 'idle' ? (
              <p className="mt-3 text-[12.5px] text-fg-faint">Checking for an existing session…</p>
            ) : null}
          </div>
        </Panel>

        {/* ---------------- Connected repository ---------------- */}
        {repository && selection ? (
          <>
            <Panel className="mt-5 animate-fade-up">
              <PanelHeader
                icon={<CheckIcon className="h-4.5 w-4.5 text-merged" strokeWidth={2.6} />}
                title={
                  <span className="flex flex-wrap items-center gap-2.5">
                    {repository.fullName}
                    <Chip tone="merged">Cloned</Chip>
                  </span>
                }
                subtitle="Cloned into an isolated workspace on the VisualMerge backend."
                actions={
                  <a
                    href={repository.webUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 text-[12.5px] text-fg-muted transition hover:text-fg"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                    Open on GitHub
                  </a>
                }
              />
              <div className="grid gap-3 p-5 sm:grid-cols-4">
                {[
                  { label: 'Owner', value: repository.owner },
                  { label: 'Default branch', value: repository.defaultBranch, mono: true },
                  { label: 'Branches found', value: String(repository.branchCount) },
                  {
                    label: 'Clone size',
                    value:
                      repository.sizeKb > 1024
                        ? `${(repository.sizeKb / 1024).toFixed(1)} MB`
                        : `${repository.sizeKb} KB`,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3"
                  >
                    <p
                      className={cn(
                        'truncate text-[15px] font-semibold text-fg',
                        stat.mono && 'font-mono text-[13.5px]',
                      )}
                    >
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[12px] text-fg-faint">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Panel>

            {/* ---------------- Branch selection ---------------- */}
            <Panel className="mt-5 animate-fade-up">
              <PanelHeader
                icon={<LayersIcon className="h-4.5 w-4.5 text-fg-muted" />}
                title="Select branches to merge"
                subtitle="These are the real branches discovered in the clone."
              />
              <div className="p-5">
                {singleBranch ? (
                  <div className="flex items-start gap-3 rounded-lg border border-warn/30 bg-warn/8 p-4">
                    <AlertIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-warn" />
                    <div>
                      <p className="text-[13.5px] font-semibold text-fg">
                        This repository only has one branch
                      </p>
                      <p className="mt-1 text-[13px] text-fg-muted">
                        A merge analysis needs at least two branches to compare. Connect a
                        repository with more branches.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <BranchSelect
                        label="Base"
                        hint="merge target"
                        tone="base"
                        branches={repository.branches}
                        value={selection.base}
                        onChange={(base) => setSelection({ ...selection, base })}
                      />
                      <BranchSelect
                        label="Branch A"
                        tone="a"
                        branches={repository.branches}
                        value={selection.branchA}
                        onChange={(branchA) => setSelection({ ...selection, branchA })}
                      />
                      <BranchSelect
                        label="Branch B"
                        tone="b"
                        branches={repository.branches}
                        value={selection.branchB}
                        onChange={(branchB) => setSelection({ ...selection, branchB })}
                      />
                    </div>

                    {selectionProblem ? (
                      <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-warn/30 bg-warn/8 px-4 py-3">
                        <AlertIcon className="h-4 w-4 shrink-0 text-warn" />
                        <p className="text-[13px] text-fg-muted">{selectionProblem}</p>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </Panel>

            {/* ---------------- Honest Phase 2 boundary ---------------- */}
            <Panel className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex items-start gap-3">
                  <ClockIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-fg-faint" />
                  <div>
                    <p className="text-[13.5px] font-semibold text-fg">
                      Merge analysis is not available yet
                    </p>
                    <p className="mt-1 max-w-[520px] text-[13px] text-fg-muted">
                      Phase 1 connects the repository and discovers branches. Real three-way merge
                      analysis and conflict detection arrive in Phase 2 — this button stays disabled
                      until it genuinely works.
                    </p>
                  </div>
                </div>
                <Button variant="primary" size="lg" disabled title="Available in Phase 2">
                  <GitMergeIcon className="h-4.5 w-4.5" />
                  Start Merge Analysis
                </Button>
              </div>
            </Panel>
          </>
        ) : null}

        {/* ---------------- Safety note ---------------- */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-ink-800 bg-ink-850/40 p-5">
          <ShieldCheckIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-merged" />
          <div>
            <p className="text-[13.5px] font-semibold text-fg">Your repository is never modified</p>
            <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
              VisualMerge clones into a temporary workspace it owns and works only there. It never
              pushes, never commits to your branches and never touches your local checkout.
              Disconnecting deletes the workspace.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
