import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
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

export function AppShell({
  step,
  children,
  contentClassName,
}: {
  step?: FlowStepId
  children: ReactNode
  contentClassName?: string
}) {
  const mode = useApiMode()

  return (
    <div className="app-grid-bg min-h-screen">
      <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-5 px-5">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <VisualMergeMark />
            <div className="leading-none">
              <span className="text-[15px] font-semibold tracking-tight text-fg">VisualMerge</span>
              <span className="mt-1 hidden text-[11.5px] text-fg-faint lg:block">
                Resolve conflicts by seeing the result, not reading the diff.
              </span>
            </div>
          </Link>

          <div className="mx-auto hidden xl:block">{step ? <ProgressSteps current={step} /> : null}</div>

          <div className="ml-auto flex items-center gap-2.5">
            <Chip tone="neutral" className="hidden sm:inline-flex">
              <span className="font-mono">causekind/causekind-web</span>
            </Chip>
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

        {step ? (
          <div className="mx-auto max-w-[1440px] border-t border-ink-800/70 px-5 py-2 xl:hidden">
            <ProgressSteps current={step} />
          </div>
        ) : null}
      </header>

      <main className={cn('mx-auto max-w-[1440px] px-5 py-8', contentClassName)}>{children}</main>
    </div>
  )
}
