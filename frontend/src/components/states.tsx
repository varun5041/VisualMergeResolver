import type { ReactNode } from 'react'
import { AlertIcon, RefreshIcon } from './Icons'
import { Button } from './ui'
import { cn } from '../lib/utils'
import type { ApiError } from '../services/http'

/** A placeholder block used while real data is on its way. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-ink-800/80',
        className,
      )}
      aria-hidden="true"
    />
  )
}

export function LoadingRows({ rows = 3, height = 'h-[72px]' }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={cn('w-full', height)} />
      ))}
    </div>
  )
}

/**
 * Shown when a request failed.
 *
 * <p>Always says what went wrong and offers a way forward — the app never
 * bounces a failure back to the dashboard as if nothing happened.
 */
export function ErrorState({
  error,
  onRetry,
  action,
  className,
}: {
  error: ApiError
  onRetry?: () => void
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border border-danger/30 bg-danger/[0.06] p-5 sm:flex-row sm:items-center',
        className,
      )}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-danger/30 bg-danger/10 text-danger">
        <AlertIcon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-fg">{error.message}</p>
        <p className="mt-0.5 font-mono text-[11.5px] text-fg-faint">{error.code}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {onRetry && (
          <Button size="sm" onClick={onRetry}>
            <RefreshIcon className="h-3.5 w-3.5" />
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}

/** Shown when a request succeeded and there is genuinely nothing yet. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-700 bg-ink-900/30 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="grid h-12 w-12 place-items-center rounded-xl border border-ink-700 bg-ink-850/60 text-fg-muted">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-fg">{title}</h3>
      <p className="mt-2 max-w-[360px] text-[13px] leading-relaxed text-fg-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
