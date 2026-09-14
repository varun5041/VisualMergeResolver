import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

type Status = 'conflict' | 'compatible' | 'resolved' | 'pending' | 'running' | 'passed'

const config: Record<Status, { dot: string; ring: string; text: string; defaultLabel: string }> = {
  conflict: {
    dot: 'bg-danger',
    ring: 'border-danger/35 bg-danger/10',
    text: 'text-danger',
    defaultLabel: 'UI Conflict',
  },
  compatible: {
    dot: 'bg-merged',
    ring: 'border-merged/35 bg-merged/10',
    text: 'text-merged',
    defaultLabel: 'Compatible',
  },
  resolved: {
    dot: 'bg-merged',
    ring: 'border-merged/35 bg-merged/10',
    text: 'text-merged',
    defaultLabel: 'Resolved',
  },
  pending: {
    dot: 'bg-fg-faint',
    ring: 'border-ink-600 bg-ink-800',
    text: 'text-fg-muted',
    defaultLabel: 'Pending',
  },
  running: {
    dot: 'bg-brand-400',
    ring: 'border-brand-400/35 bg-brand-400/10',
    text: 'text-brand-400',
    defaultLabel: 'Running',
  },
  passed: {
    dot: 'bg-merged',
    ring: 'border-merged/35 bg-merged/10',
    text: 'text-merged',
    defaultLabel: 'Passed',
  },
}

export function StatusBadge({
  status,
  children,
  className,
}: {
  status: Status
  children?: ReactNode
  className?: string
}) {
  const style = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11.5px] font-medium',
        style.ring,
        style.text,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === 'running' ? (
          <span
            className={cn('absolute inline-flex h-full w-full rounded-full opacity-70', style.dot)}
            style={{ animation: 'pulse-ring 1.6s ease-out infinite' }}
          />
        ) : null}
        <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', style.dot)} />
      </span>
      {children ?? style.defaultLabel}
    </span>
  )
}
