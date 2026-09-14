import { cn } from '../lib/utils'
import { CheckIcon } from './Icons'

export const flowSteps = [
  { id: 'compare', label: 'Compare' },
  { id: 'conflicts', label: 'Conflicts' },
  { id: 'resolve', label: 'Resolve' },
  { id: 'merge', label: 'Merge' },
  { id: 'verify', label: 'Verify' },
] as const

export type FlowStepId = (typeof flowSteps)[number]['id']

export function ProgressSteps({ current }: { current: FlowStepId }) {
  const currentIndex = flowSteps.findIndex((step) => step.id === current)

  return (
    <ol className="flex items-center gap-1.5" aria-label="Merge progress">
      {flowSteps.map((step, index) => {
        const done = index < currentIndex
        const active = index === currentIndex
        return (
          <li key={step.id} className="flex items-center gap-1.5">
            <div
              className={cn(
                'flex items-center gap-2 rounded-md px-2.5 py-1 text-[12.5px] transition-colors',
                active && 'bg-brand-500/12 text-brand-400',
                done && 'text-fg-muted',
                !done && !active && 'text-fg-faint',
              )}
            >
              <span
                className={cn(
                  'flex h-4.5 w-4.5 items-center justify-center rounded-full border text-[10px] font-semibold',
                  active && 'border-brand-400 bg-brand-500/20 text-brand-400',
                  done && 'border-merged/50 bg-merged/15 text-merged',
                  !done && !active && 'border-ink-600 text-fg-faint',
                )}
              >
                {done ? <CheckIcon className="h-2.5 w-2.5" strokeWidth={3} /> : index + 1}
              </span>
              <span className={cn(active && 'font-medium')}>{step.label}</span>
            </div>
            {index < flowSteps.length - 1 ? (
              <span
                className={cn('h-px w-4', index < currentIndex ? 'bg-merged/40' : 'bg-ink-700')}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
