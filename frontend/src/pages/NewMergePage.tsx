import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BranchSelect } from '../components/BranchSelect'
import {
  AlertIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  GitBranchIcon,
  GitMergeIcon,
} from '../components/Icons'
import { Button, Chip, Panel, PanelHeader } from '../components/ui'
import { cn } from '../lib/utils'
import { repositoryApi } from '../services/repositoryApi'
import type { BranchSelection, GitRepository } from '../types/repository'
import { RepositoryError } from '../types/repository'
import { useFlow } from '../state/FlowContext'


function pickDefaultSelection(repository: GitRepository): BranchSelection {
  const names = repository.branches.map((b) => b.name)
  const base = repository.defaultBranch
  const others = names.filter((n) => n !== base)
  return {
    base,
    branchA: others[0] ?? base,
    branchB: others[1] ?? others[0] ?? base,
  }
}

type Step = 'repo' | 'branches' | 'confirm'

export function NewMergePage() {
  const navigate = useNavigate()
  const { reset } = useFlow()
  const [step, setStep] = useState<Step>('repo')
  const [url, setUrl] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [repository, setRepository] = useState<GitRepository | null>(null)
  const [selection, setSelection] = useState<BranchSelection | null>(null)
  const [error, setError] = useState<RepositoryError | null>(null)

  const connect = useCallback(async () => {
    if (!url.trim()) return
    setError(null)
    setConnecting(true)
    try {
      const repo = await repositoryApi.connect(url)
      setRepository(repo)
      setSelection(pickDefaultSelection(repo))
      setStep('branches')
    } catch (failure) {
      setError(
        failure instanceof RepositoryError
          ? failure
          : new RepositoryError('CLONE_FAILED', 'Something went wrong connecting that repository.'),
      )
    } finally {
      setConnecting(false)
    }
  }, [url])

  const selectionProblem = useMemo(() => {
    if (!selection) return null
    if (selection.branchA === selection.branchB) return 'Branch A and Branch B must be different branches.'
    if (selection.branchA === selection.base || selection.branchB === selection.base)
      return 'Branch A and Branch B should both differ from the base branch.'
    return null
  }, [selection])

  const startMerge = () => {
    reset()
    navigate('/analyzing')
  }

  const useDemoMode = () => {
    reset()
    navigate('/analyzing')
  }

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
        Choose a repository and branches to compare visually.
      </p>

      {/* Progress steps */}
      <div className="mt-6 flex items-center gap-2">
        {(['Repository', 'Branches', 'Confirm'] as const).map((label, i) => {
          const stepKeys: Step[] = ['repo', 'branches', 'confirm']
          const currentIdx = stepKeys.indexOf(step)
          const done = i < currentIdx
          const active = i === currentIdx
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1 text-[12.5px] transition',
                active && 'bg-brand-500/12 font-medium text-brand-400',
                done && 'text-merged',
                !active && !done && 'text-fg-faint',
              )}>
                <span className={cn(
                  'grid h-5 w-5 place-items-center rounded-full border text-[10px] font-semibold',
                  active && 'border-brand-400 bg-brand-500/20 text-brand-400',
                  done && 'border-merged/50 bg-merged/15 text-merged',
                  !active && !done && 'border-ink-600 text-fg-faint',
                )}>
                  {done ? <CheckIcon className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </span>
                {label}
              </div>
              {i < 2 && <span className={cn('h-px w-6', i < currentIdx ? 'bg-merged/40' : 'bg-ink-700')} />}
            </div>
          )
        })}
      </div>

      {/* Step 1: Repository */}
      {step === 'repo' && (
        <Panel className="mt-6 animate-fade-up">
          <PanelHeader
            icon={<GitBranchIcon className="h-4.5 w-4.5 text-brand-400" />}
            title="Select repository"
            subtitle="Enter a public GitHub repository URL, or use demo mode."
          />
          <div className="p-5">
            <form
              onSubmit={(e) => { e.preventDefault(); connect() }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={connecting}
                placeholder="https://github.com/username/project"
                spellCheck={false}
                autoComplete="off"
                className={cn(
                  'h-11 flex-1 rounded-lg border border-ink-600 bg-ink-950 px-4',
                  'font-mono text-[13.5px] text-fg placeholder:text-fg-faint',
                  'transition outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
                  'disabled:opacity-60',
                )}
              />
              <Button type="submit" variant="primary" size="lg" disabled={!url.trim() || connecting}>
                {connecting ? 'Connecting…' : 'Connect'}
                {!connecting && <ArrowRightIcon className="h-4 w-4" />}
              </Button>
            </form>

            {error && (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/8 p-4">
                <AlertIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-danger" />
                <div>
                  <p className="text-[13px] font-semibold text-fg">{error.message}</p>
                  <Chip tone="danger" className="mt-1">{error.code}</Chip>
                </div>
              </div>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ink-700" /></div>
              <div className="relative flex justify-center text-[12px]"><span className="bg-ink-850/80 px-3 text-fg-faint">or</span></div>
            </div>

            <button
              type="button"
              onClick={useDemoMode}
              className="flex w-full items-center justify-between rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3 transition hover:border-ink-600 hover:bg-ink-800/50"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-warn/10 text-warn">
                  <GitMergeIcon className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <p className="text-[13.5px] font-medium text-fg">Use demo mode</p>
                  <p className="text-[12px] text-fg-faint">Experience the full workflow with sample data</p>
                </div>
              </div>
              <Chip tone="warn">Mock data</Chip>
            </button>
          </div>
        </Panel>
      )}

      {/* Step 2: Branches */}
      {step === 'branches' && repository && selection && (
        <Panel className="mt-6 animate-fade-up">
          <PanelHeader
            icon={<GitBranchIcon className="h-4.5 w-4.5 text-brand-400" />}
            title="Select branches"
            subtitle={`${repository.branchCount} branches found in ${repository.fullName}`}
          />
          <div className="p-5">
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

            {selectionProblem && (
              <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-warn/30 bg-warn/8 px-4 py-3">
                <AlertIcon className="h-4 w-4 shrink-0 text-warn" />
                <p className="text-[13px] text-fg-muted">{selectionProblem}</p>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-4">
              <Button onClick={() => setStep('repo')}>
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={!!selectionProblem}
                onClick={() => setStep('confirm')}
              >
                Continue
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && repository && selection && (
        <Panel className="mt-6 animate-fade-up">
          <PanelHeader
            icon={<GitMergeIcon className="h-4.5 w-4.5 text-brand-400" />}
            title="Confirm merge session"
            subtitle="VisualMerge will build both branches and compare them visually."
          />
          <div className="p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3">
                <p className="text-[12px] text-fg-faint">Repository</p>
                <p className="mt-1 truncate font-mono text-[13px] font-medium text-fg">{repository.fullName}</p>
              </div>
              <div className="rounded-lg border border-branch-a/20 bg-branch-a/5 px-4 py-3">
                <p className="text-[12px] text-branch-a">Branch A</p>
                <p className="mt-1 truncate font-mono text-[13px] font-medium text-fg">{selection.branchA}</p>
              </div>
              <div className="rounded-lg border border-branch-b/20 bg-branch-b/5 px-4 py-3">
                <p className="text-[12px] text-branch-b">Branch B</p>
                <p className="mt-1 truncate font-mono text-[13px] font-medium text-fg">{selection.branchB}</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3">
              <p className="text-[12px] text-fg-faint">Base branch (merge target)</p>
              <p className="mt-1 font-mono text-[13px] font-medium text-fg">{selection.base}</p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <Button onClick={() => setStep('branches')}>
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </Button>
              <Button variant="primary" size="lg" onClick={startMerge}>
                <GitMergeIcon className="h-4.5 w-4.5" />
                Create Session
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Panel>
      )}
    </div>
  )
}
