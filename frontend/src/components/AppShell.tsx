import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getApiMode, onApiModeChange } from '../services/api'
import type { ApiMode } from '../services/api'
import { cn } from '../lib/utils'
import { ProgressSteps } from './ProgressSteps'
import type { FlowStepId } from './ProgressSteps'
import { Chip } from './ui'

export function VisualMergeMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="vm-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7aa2ff" />
          <stop offset="100%" stopColor="#4566d8" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#vm-mark)" />
      <circle cx="11" cy="9.5" r="2.3" fill="#fff" />
      <circle cx="11" cy="22.5" r="2.3" fill="#fff" />
      <circle cx="22" cy="16" r="2.3" fill="#fff" />
      <path
        d="M11 12v8M13.2 9.5c3 0 6.4 1.4 6.6 5.2M13.2 22.5c3 0 6.4-1.4 6.6-5.2"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function useApiMode(): ApiMode {
  const [mode, setMode] = useState<ApiMode>(getApiMode())
  useEffect(() => onApiModeChange(setMode), [])
  return mode
}

/**
 * Application shell for the merge-flow screens.
 *
 * When rendered inside AppLayout (which provides its own sidebar + topbar), this
 * component renders only a thin sub-header with progress steps and repo badge —
 * no duplicate logo or navigation.
 */
export function AppShell({
  step,
  children,
  contentClassName,
  repositoryLabel = 'causekind/causekind-web',
}: {
  step?: FlowStepId
  children: ReactNode
  contentClassName?: string
  /** Repository shown in the header. Pass null to hide it. */
  repositoryLabel?: string | null
}) {
  const mode = useApiMode()

  return (
    <div className="min-h-full">
      {/* Sub-header with progress steps and status badges */}
      {step && (
        <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/85 backdrop-blur-md">
          <div className="mx-auto flex h-12 max-w-[1560px] items-center gap-5 px-5">
            <div className="flex-1 overflow-x-auto">
              <ProgressSteps current={step} />
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              {repositoryLabel ? (
                <Chip tone="neutral" className="hidden sm:inline-flex">
                  <span className="font-mono">{repositoryLabel}</span>
                </Chip>
              ) : null}
              <Chip tone={mode === 'live' ? 'merged' : 'warn'}>
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    mode === 'live' ? 'bg-merged' : 'bg-warn',
                  )}
                />
                {mode === 'live' ? 'API connected' : 'Offline mock data'}
              </Chip>
            </div>
          </div>
        </header>
      )}

      <div className={cn('mx-auto max-w-[1560px] px-5 py-6', contentClassName)}>{children}</div>
    </div>
  )
}
