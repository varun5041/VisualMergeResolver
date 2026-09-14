import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { BranchBadge } from '../components/BranchBadge'
import { CheckIcon, GitMergeIcon } from '../components/Icons'
import { Panel } from '../components/ui'
import { analysisSteps, demoProject } from '../data/mockData'
import { useStepSequence } from '../lib/hooks'
import { cn } from '../lib/utils'
import { api } from '../services/api'
import { useFlow } from '../state/FlowContext'
import type { Comparison } from '../types'

const STEP_DURATIONS = [1000, 950, 1100, 900]

export function Analyzing() {
  const navigate = useNavigate()
  const { project, setComparison } = useFlow()
  const active = project ?? demoProject
  const [comparison, setLocalComparison] = useState<Comparison | null>(null)
  const { completed, done } = useStepSequence(STEP_DURATIONS)
  const requested = useRef(false)

  useEffect(() => {
    if (requested.current) return
    requested.current = true
    api
      .compare(active.id, active.baseBranch, active.branchA.name, active.branchB.name)
      .then(setLocalComparison)
  }, [active])

  useEffect(() => {
    if (!done || !comparison) return
    setComparison(comparison)
    const timer = window.setTimeout(() => navigate('/conflicts'), 420)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, comparison])

  const progress = Math.round(
    ((completed + (done ? 0 : 0.35)) / analysisSteps.length) * 100,
  )

  return (
    <AppShell step="compare">
      <div className="flex min-h-[62vh] items-center justify-center">
        <Panel className="w-full max-w-xl animate-fade-up p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative grid h-16 w-16 place-items-center">
              <span className="absolute inset-0 rounded-2xl bg-brand-500/25 animate-pulse-ring" />
              <span className="absolute inset-0 rounded-2xl border border-brand-400/30" />
              <GitMergeIcon className="relative h-7 w-7 text-brand-400" />
            </div>

            <h1 className="mt-5 text-[20px] font-semibold tracking-tight text-fg">
              Comparing branches
            </h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <BranchBadge name={active.branchA.name} tone="a" size="sm" />
              <span className="text-[12px] text-fg-faint">vs</span>
              <BranchBadge name={active.branchB.name} tone="b" size="sm" />
            </div>
          </div>

          <div className="mt-7 h-1 w-full overflow-hidden rounded-full bg-ink-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>

          <ul className="mt-6 space-y-2.5">
            {analysisSteps.map((step, index) => {
              const finished = index < completed
              const running = index === completed
              return (
                <li
                  key={step}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-4 py-2.5 transition-all duration-300',
                    finished && 'border-merged/20 bg-merged/6',
                    running && 'border-brand-400/30 bg-brand-400/8',
                    !finished && !running && 'border-ink-800 bg-ink-900/40 opacity-40',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-5 w-5 place-items-center rounded-full border',
                      finished && 'border-merged/50 bg-merged/15 text-merged',
                      running && 'border-brand-400/60 text-brand-400',
                      !finished && !running && 'border-ink-600 text-fg-faint',
                    )}
                  >
                    {finished ? (
                      <CheckIcon className="h-3 w-3" strokeWidth={3} />
                    ) : running ? (
                      <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-current" />
                    )}
                  </span>
                  <span
                    className={cn('text-[13.5px]', finished ? 'text-fg-muted' : 'text-fg')}
                  >
                    {step}
                  </span>
                </li>
              )
            })}
          </ul>

          <p className="mt-6 text-center font-mono text-[11.5px] text-fg-faint">
            {done && !comparison
              ? 'waiting for analysis service…'
              : `scanning ${active.repository}`}
          </p>
        </Panel>
      </div>
    </AppShell>
  )
}
