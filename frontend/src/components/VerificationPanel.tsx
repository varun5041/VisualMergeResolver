import { useEffect } from 'react'
import type { Verification } from '../types'
import { useStepSequence } from '../lib/hooks'
import { cn } from '../lib/utils'
import { CheckIcon, ShieldCheckIcon } from './Icons'
import { Panel, PanelHeader } from './ui'
import { StatusBadge } from './StatusBadge'

export function VerificationPanel({
  verification,
  onComplete,
}: {
  verification: Verification
  onComplete?: () => void
}) {
  const { completed, done } = useStepSequence(verification.steps.map((step) => step.durationMs))

  useEffect(() => {
    // Fires once the last check lands; the parent unlocks the final CTA.
    if (done) onComplete?.()
  }, [done, onComplete])

  return (
    <Panel>
      <PanelHeader
        icon={<ShieldCheckIcon className="h-4.5 w-4.5 text-merged" />}
        title="Visual Verification"
        subtitle="The merged build is rendered and checked before anything is proposed."
        actions={
          done ? (
            <StatusBadge status="passed">All checks passed</StatusBadge>
          ) : (
            <StatusBadge status="running">Running</StatusBadge>
          )
        }
      />

      <div className="p-5">
        <ul className="space-y-2">
          {verification.steps.map((step, index) => {
            const finished = index < completed
            const running = index === completed
            return (
              <li
                key={step.id}
                className={cn(
                  'flex items-center justify-between gap-4 rounded-lg border px-4 py-2.5 transition-all duration-300',
                  finished && 'border-merged/20 bg-merged/6',
                  running && 'border-brand-400/30 bg-brand-400/8',
                  !finished && !running && 'border-ink-700 bg-ink-900/40 opacity-45',
                )}
              >
                <span className="flex items-center gap-3">
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
                    className={cn(
                      'text-[13.5px]',
                      finished ? 'text-fg' : running ? 'text-fg' : 'text-fg-muted',
                    )}
                  >
                    {step.label}
                  </span>
                </span>
                {finished ? (
                  <CheckIcon className="h-4 w-4 text-merged" strokeWidth={2.6} />
                ) : running ? (
                  <span className="font-mono text-[11.5px] text-brand-400">running…</span>
                ) : null}
              </li>
            )
          })}
        </ul>

        <div
          className={cn(
            'mt-5 rounded-lg border p-5 transition-all duration-500',
            done ? 'animate-fade-up border-merged/30 bg-merged/8' : 'border-ink-700 bg-ink-900/40',
          )}
        >
          {done ? (
            <>
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-merged/20 text-merged">
                  <CheckIcon className="h-4 w-4" strokeWidth={3} />
                </span>
                <p className="text-[15px] font-semibold text-fg">{verification.verdict}</p>
              </div>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {verification.checks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center gap-2.5 rounded-md border border-ink-700 bg-ink-900/60 px-3.5 py-2.5"
                  >
                    <CheckIcon className="h-3.5 w-3.5 text-merged" strokeWidth={3} />
                    <span className="text-[13px] text-fg">{check.label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[13px] text-fg-muted">
              Waiting for all checks to finish before proposing the merge…
            </p>
          )}
        </div>
      </div>
    </Panel>
  )
}
