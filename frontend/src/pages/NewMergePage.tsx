import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  FolderIcon,
  GitBranchIcon,
  GitMergeIcon,
  LockIcon,
  SearchIcon,
} from '../components/Icons'
import { EmptyState, ErrorState, LoadingRows } from '../components/states'
import { Button, Chip, Panel, PanelHeader } from '../components/ui'
import { useAsync } from '../lib/useAsync'
import { cn } from '../lib/utils'
import { ApiError, toApiError } from '../services/http'
import { githubApi, mergeSessionApi } from '../services/visualMergeApi'
import type { GitHubBranch, GitHubRepository } from '../types/api'

const STEPS = ['Repository', 'Base branch', 'Branch A', 'Branch B', 'Compare'] as const
type StepIndex = 0 | 1 | 2 | 3 | 4

function StepRail({ current }: { current: StepIndex }) {
  return (
    <ol className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
      {STEPS.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1 text-[12.5px] transition',
                active && 'bg-brand-500/12 font-medium text-brand-400',
                done && 'text-merged',
                !active && !done && 'text-fg-faint',
              )}
            >
              <span
                className={cn(
                  'grid h-5 w-5 place-items-center rounded-full border text-[10px] font-semibold',
                  active && 'border-brand-400 bg-brand-500/20 text-brand-400',
                  done && 'border-merged/50 bg-merged/15 text-merged',
                  !active && !done && 'border-ink-600 text-fg-faint',
                )}
              >
                {done ? <CheckIcon className="h-3 w-3" strokeWidth={3} /> : index + 1}
              </span>
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <span className={cn('h-px w-5', done ? 'bg-merged/40' : 'bg-ink-700')} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** One selectable branch. Disabled when it is already taken by another slot. */
function BranchOption({
  branch,
  selected,
  disabledReason,
  onSelect,
  tone,
}: {
  branch: GitHubBranch
  selected: boolean
  disabledReason: string | null
  onSelect: () => void
  tone: 'base' | 'a' | 'b'
}) {
  return (
    <button
      type="button"
      disabled={disabledReason !== null}
      onClick={onSelect}
      title={disabledReason ?? undefined}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left transition',
        'disabled:cursor-not-allowed disabled:opacity-40',
        selected && tone === 'base' && 'border-brand-400/50 bg-brand-500/10',
        selected && tone === 'a' && 'border-branch-a/50 bg-branch-a/10',
        selected && tone === 'b' && 'border-branch-b/50 bg-branch-b/10',
        !selected && 'border-ink-700 bg-ink-900/50 hover:border-ink-600 hover:bg-ink-800/50',
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <GitBranchIcon
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            selected && tone === 'base' && 'text-brand-400',
            selected && tone === 'a' && 'text-branch-a',
            selected && tone === 'b' && 'text-branch-b',
            !selected && 'text-fg-faint',
          )}
        />
        <span className="truncate font-mono text-[13px] text-fg">{branch.name}</span>
        {branch.isProtected && <Chip tone="neutral">protected</Chip>}
      </span>
      {selected && <CheckIcon className="h-4 w-4 shrink-0 text-merged" strokeWidth={3} />}
    </button>
  )
}

function BranchPicker({
  title,
  subtitle,
  branches,
  value,
  tone,
  takenBy,
  onSelect,
}: {
  title: string
  subtitle: string
  branches: GitHubBranch[]
  value: string | null
  tone: 'base' | 'a' | 'b'
  takenBy: Record<string, string>
  onSelect: (name: string) => void
}) {
  const [query, setQuery] = useState('')
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return branches
    return branches.filter((branch) => branch.name.toLowerCase().includes(needle))
  }, [branches, query])

  return (
    <Panel className="mt-6 animate-fade-up">
      <PanelHeader
        icon={<GitBranchIcon className="h-4.5 w-4.5 text-brand-400" />}
        title={title}
        subtitle={subtitle}
      />
      <div className="p-5">
        {branches.length > 8 && (
          <div className="relative mb-3">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fg-faint" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter branches"
              spellCheck={false}
              className="h-10 w-full rounded-lg border border-ink-600 bg-ink-950 pr-4 pl-9 text-[13.5px] text-fg transition outline-none placeholder:text-fg-faint focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
            />
          </div>
        )}
        <div className="max-h-[340px] space-y-1.5 overflow-y-auto scrollbar-slim pr-1">
          {visible.map((branch) => (
            <BranchOption
              key={branch.name}
              branch={branch}
              tone={tone}
              selected={value === branch.name}
              disabledReason={takenBy[branch.name] ?? null}
              onSelect={() => onSelect(branch.name)}
            />
          ))}
          {visible.length === 0 && (
            <p className="py-8 text-center text-[13px] text-fg-muted">
              No branch matches “{query}”.
            </p>
          )}
        </div>
      </div>
    </Panel>
  )
}

export function NewMergePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [repository, setRepository] = useState<GitHubRepository | null>(null)
  const [baseBranch, setBaseBranch] = useState<string | null>(null)
  const [branchA, setBranchA] = useState<string | null>(null)
  const [branchB, setBranchB] = useState<string | null>(null)
  const [step, setStep] = useState<StepIndex>(0)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<ApiError | null>(null)

  const repositories = useAsync((signal) => githubApi.repositories(signal), [])

  // Every branch comes from GitHub; nothing is assumed about what exists.
  const branches = useAsync(
    (signal) => githubApi.branches(repository!.owner, repository!.name, signal),
    [repository?.id],
    { enabled: repository !== null },
  )

  const selectRepository = useCallback((next: GitHubRepository) => {
    setRepository(next)
    setBaseBranch(null)
    setBranchA(null)
    setBranchB(null)
    setCreateError(null)
    setStep(1)
  }, [])

  // Arriving from the repositories page with a repository already chosen.
  const presetOwner = searchParams.get('owner')
  const presetRepo = searchParams.get('repo')
  useEffect(() => {
    if (!presetOwner || !presetRepo || repository || !repositories.data) return
    const match = repositories.data.find(
      (candidate) => candidate.owner === presetOwner && candidate.name === presetRepo,
    )
    if (match) selectRepository(match)
  }, [presetOwner, presetRepo, repository, repositories.data, selectRepository])

  // The default branch is the obvious base, so it is preselected once known.
  useEffect(() => {
    if (step === 1 && baseBranch === null && branches.data && repository?.defaultBranch) {
      if (branches.data.some((branch) => branch.name === repository.defaultBranch)) {
        setBaseBranch(repository.defaultBranch)
      }
    }
  }, [step, baseBranch, branches.data, repository?.defaultBranch])

  const filteredRepositories = useMemo(() => {
    if (!repositories.data) return []
    const needle = query.trim().toLowerCase()
    if (!needle) return repositories.data
    return repositories.data.filter((candidate) =>
      candidate.fullName.toLowerCase().includes(needle),
    )
  }, [repositories.data, query])

  const createSession = async () => {
    if (!repository || !baseBranch || !branchA || !branchB) return
    setCreating(true)
    setCreateError(null)
    try {
      const session = await mergeSessionApi.create({
        owner: repository.owner,
        repository: repository.name,
        baseBranch,
        branchA,
        branchB,
      })
      navigate(`/merge/${session.id}`)
    } catch (failure) {
      // The user stays on this page with the reason visible; silently going
      // back to the dashboard would hide a real problem.
      setCreateError(toApiError(failure))
    } finally {
      setCreating(false)
    }
  }

  const back = () => setStep((current) => Math.max(0, current - 1) as StepIndex)

  return (
    <div className="mx-auto max-w-[800px] px-5 py-8">
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] text-fg-faint transition hover:text-fg-muted"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to dashboard
      </button>

      <h1 className="text-[22px] font-bold tracking-tight text-fg">Create a merge session</h1>
      <p className="mt-1 text-[14px] text-fg-muted">
        Pick one of your GitHub repositories, then the three branches to compare.
      </p>

      <StepRail current={step} />

      {/* ── Step 1: repository ── */}
      {step === 0 && (
        <Panel className="mt-6 animate-fade-up">
          <PanelHeader
            icon={<FolderIcon className="h-4.5 w-4.5 text-brand-400" />}
            title="Select a repository"
            subtitle="These come straight from your GitHub account."
          />
          <div className="p-5">
            {repositories.isLoading && <LoadingRows rows={4} height="h-[52px]" />}

            {repositories.status === 'error' && repositories.error && (
              <ErrorState error={repositories.error} onRetry={repositories.reload} />
            )}

            {repositories.status === 'success' && repositories.data?.length === 0 && (
              <EmptyState
                icon={FolderIcon}
                title="No repositories to merge"
                description="Your GitHub account cannot reach any repositories yet. Create one on GitHub and it will show up here."
              />
            )}

            {repositories.status === 'success' && (repositories.data?.length ?? 0) > 0 && (
              <>
                <div className="relative mb-3">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fg-faint" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search your repositories"
                    spellCheck={false}
                    className="h-10 w-full rounded-lg border border-ink-600 bg-ink-950 pr-4 pl-9 text-[13.5px] text-fg transition outline-none placeholder:text-fg-faint focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
                  />
                </div>
                <div className="max-h-[360px] space-y-1.5 overflow-y-auto scrollbar-slim pr-1">
                  {filteredRepositories.map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => selectRepository(candidate)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3 text-left transition hover:border-ink-600 hover:bg-ink-800/50"
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-mono text-[13.5px] font-medium text-fg">
                            {candidate.fullName}
                          </span>
                          {candidate.isPrivate && (
                            <LockIcon className="h-3 w-3 shrink-0 text-warn" />
                          )}
                        </span>
                        {candidate.defaultBranch && (
                          <span className="mt-0.5 block text-[11.5px] text-fg-faint">
                            default: <span className="font-mono">{candidate.defaultBranch}</span>
                          </span>
                        )}
                      </span>
                      <ArrowRightIcon className="h-4 w-4 shrink-0 text-fg-faint" />
                    </button>
                  ))}
                  {filteredRepositories.length === 0 && (
                    <p className="py-8 text-center text-[13px] text-fg-muted">
                      No repository matches “{query}”.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </Panel>
      )}

      {/* ── Steps 2-4: branches ── */}
      {step >= 1 && step <= 3 && repository && (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-2.5">
            <FolderIcon className="h-4 w-4 text-fg-faint" />
            <span className="font-mono text-[13px] text-fg">{repository.fullName}</span>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="ml-auto text-[12.5px] text-brand-400 transition hover:text-brand-500"
            >
              Change repository
            </button>
          </div>

          {branches.isLoading && (
            <Panel className="mt-6 p-5">
              <LoadingRows rows={5} height="h-[42px]" />
            </Panel>
          )}

          {branches.status === 'error' && branches.error && (
            <ErrorState className="mt-6" error={branches.error} onRetry={branches.reload} />
          )}

          {branches.status === 'success' && (branches.data?.length ?? 0) < 2 && (
            <EmptyState
              className="mt-6"
              icon={GitBranchIcon}
              title="Not enough branches to compare"
              description={`${repository.fullName} has fewer than two branches, so there is nothing to merge yet. Push another branch and come back.`}
              action={<Button onClick={() => setStep(0)}>Pick another repository</Button>}
            />
          )}

          {branches.status === 'success' && (branches.data?.length ?? 0) >= 2 && (
            <>
              {step === 1 && (
                <BranchPicker
                  title="Select the base branch"
                  subtitle="The branch both changes will eventually merge into."
                  branches={branches.data!}
                  value={baseBranch}
                  tone="base"
                  takenBy={{}}
                  onSelect={(name) => {
                    setBaseBranch(name)
                    if (branchA === name) setBranchA(null)
                    if (branchB === name) setBranchB(null)
                    setStep(2)
                  }}
                />
              )}

              {step === 2 && (
                <BranchPicker
                  title="Select Branch A"
                  subtitle="The first of the two branches to compare."
                  branches={branches.data!}
                  value={branchA}
                  tone="a"
                  takenBy={branchesTakenBy({ base: baseBranch, b: branchB })}
                  onSelect={(name) => {
                    setBranchA(name)
                    setStep(3)
                  }}
                />
              )}

              {step === 3 && (
                <BranchPicker
                  title="Select Branch B"
                  subtitle="The second branch. It must differ from Branch A."
                  branches={branches.data!}
                  value={branchB}
                  tone="b"
                  takenBy={branchesTakenBy({ base: baseBranch, a: branchA })}
                  onSelect={(name) => {
                    setBranchB(name)
                    setStep(4)
                  }}
                />
              )}

              <div className="mt-4 flex items-center justify-between">
                <Button onClick={back}>
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </Button>
                {step === 1 && baseBranch && (
                  <Button variant="primary" onClick={() => setStep(2)}>
                    Continue
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Step 5: compare ── */}
      {step === 4 && repository && baseBranch && branchA && branchB && (
        <Panel className="mt-6 animate-fade-up">
          <PanelHeader
            icon={<GitMergeIcon className="h-4.5 w-4.5 text-brand-400" />}
            title="Compare branches"
            subtitle="VisualMerge verifies all three branches on GitHub, then saves the session."
          />
          <div className="p-5">
            <div className="rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3">
              <p className="text-[12px] text-fg-faint">Repository</p>
              <p className="mt-1 truncate font-mono text-[13px] font-medium text-fg">
                {repository.fullName}
              </p>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3">
                <p className="text-[12px] text-fg-faint">Base branch</p>
                <p className="mt-1 truncate font-mono text-[13px] font-medium text-fg">
                  {baseBranch}
                </p>
              </div>
              <div className="rounded-lg border border-branch-a/20 bg-branch-a/5 px-4 py-3">
                <p className="text-[12px] text-branch-a">Branch A</p>
                <p className="mt-1 truncate font-mono text-[13px] font-medium text-fg">{branchA}</p>
              </div>
              <div className="rounded-lg border border-branch-b/20 bg-branch-b/5 px-4 py-3">
                <p className="text-[12px] text-branch-b">Branch B</p>
                <p className="mt-1 truncate font-mono text-[13px] font-medium text-fg">{branchB}</p>
              </div>
            </div>

            {branchA === branchB && (
              <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-warn/30 bg-warn/8 px-4 py-3">
                <AlertIcon className="h-4 w-4 shrink-0 text-warn" />
                <p className="text-[13px] text-fg-muted">
                  Branch A and Branch B must be different branches.
                </p>
              </div>
            )}

            {createError && (
              <ErrorState
                className="mt-4"
                error={createError}
                onRetry={createError.requiresSignIn ? undefined : () => void createSession()}
                action={
                  createError.requiresSignIn ? (
                    <Button size="sm" onClick={() => navigate('/login')}>
                      Sign in again
                    </Button>
                  ) : undefined
                }
              />
            )}

            <div className="mt-5 flex items-center justify-between gap-4">
              <Button onClick={back} disabled={creating}>
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={creating || branchA === branchB}
                onClick={() => void createSession()}
              >
                <GitMergeIcon className="h-4.5 w-4.5" />
                {creating ? 'Creating session…' : 'Compare branches'}
                {!creating && <ArrowRightIcon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Panel>
      )}
    </div>
  )
}

/** Maps already-used branch names to the reason they cannot be picked again. */
function branchesTakenBy(taken: { base?: string | null; a?: string | null; b?: string | null }) {
  const reasons: Record<string, string> = {}
  if (taken.base) reasons[taken.base] = 'Already selected as the base branch'
  if (taken.a) reasons[taken.a] = 'Already selected as Branch A'
  if (taken.b) reasons[taken.b] = 'Already selected as Branch B'
  return reasons
}
