import { useState } from 'react'
import type { ReactNode } from 'react'
import { useElementWidth } from '../lib/hooks'
import { cn } from '../lib/utils'
import { DesktopIcon, LockIcon, MobileIcon, RefreshIcon } from './Icons'

export type PreviewDevice = 'desktop' | 'mobile'

export const DEVICE_WIDTH: Record<PreviewDevice, number> = { desktop: 1280, mobile: 390 }

const toneStyles = {
  a: { bar: 'bg-branch-a', glow: 'shadow-[0_0_0_1px_rgba(245,165,36,0.22)]', text: 'text-branch-a' },
  b: { bar: 'bg-branch-b', glow: 'shadow-[0_0_0_1px_rgba(167,139,250,0.22)]', text: 'text-branch-b' },
  merged: { bar: 'bg-merged', glow: 'shadow-[0_0_0_1px_rgba(52,211,153,0.22)]', text: 'text-merged' },
} as const

export type PreviewTone = keyof typeof toneStyles

/**
 * Scales a fixed-width virtual page down into the available space so the
 * preview reads as a real desktop site rather than a narrow mobile one.
 */
function ScaledViewport({
  device,
  virtualHeight,
  height,
  children,
}: {
  device: PreviewDevice
  virtualHeight: number
  height: number
  children: ReactNode
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>()
  const virtualWidth = DEVICE_WIDTH[device]
  const rawScale = width > 0 ? width / virtualWidth : 0
  const scale = device === 'mobile' ? Math.min(1, rawScale) : rawScale
  const offset = device === 'mobile' ? Math.max(0, (width - virtualWidth * scale) / 2) : 0

  return (
    <div
      ref={ref}
      className="scrollbar-slim relative overflow-x-hidden overflow-y-auto bg-[#0d1117]"
      style={{ height }}
    >
      <div className="relative" style={{ height: virtualHeight * scale }}>
        {scale > 0 ? (
          <div
            className="absolute top-0 left-0 origin-top-left bg-white"
            style={{
              width: virtualWidth,
              height: virtualHeight,
              transform: `scale(${scale}) translateX(${offset / scale}px)`,
            }}
          >
            {children}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function BrowserPreview({
  label,
  branch,
  tone,
  url,
  device = 'desktop',
  onDeviceChange,
  height = 430,
  virtualHeight = 1500,
  headerRight,
  footer,
  children,
  className,
}: {
  label: string
  branch: string
  tone: PreviewTone
  url: string
  device?: PreviewDevice
  onDeviceChange?: (device: PreviewDevice) => void
  height?: number
  virtualHeight?: number
  headerRight?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}) {
  const [reloadKey, setReloadKey] = useState(0)
  const [reloading, setReloading] = useState(false)
  const style = toneStyles[tone]

  const reload = () => {
    setReloading(true)
    setReloadKey((key) => key + 1)
    window.setTimeout(() => setReloading(false), 520)
  }

  return (
    <div className={cn('flex min-w-0 flex-col', className)}>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={cn('h-6 w-1 rounded-full', style.bar)} />
          <div className="min-w-0">
            <p className="text-[13px] leading-tight font-semibold text-fg">{label}</p>
            <p className={cn('truncate font-mono text-[11.5px] leading-tight', style.text)}>
              {branch}
            </p>
          </div>
        </div>
        {headerRight}
      </div>

      <div
        className={cn(
          'overflow-hidden rounded-xl border border-ink-700 bg-ink-850',
          'shadow-[0_20px_50px_-28px_rgba(0,0,0,0.9)]',
          style.glow,
        )}
      >
        <div className="flex h-10 items-center gap-3 border-b border-ink-700 bg-ink-800 px-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>

          <button
            type="button"
            onClick={reload}
            title="Reload preview"
            className="rounded p-1 text-fg-faint transition hover:bg-ink-750 hover:text-fg-muted"
          >
            <RefreshIcon className={cn('h-3.5 w-3.5', reloading && 'animate-spin')} />
          </button>

          <div className="flex h-6.5 min-w-0 flex-1 items-center gap-1.5 rounded-md border border-ink-700 bg-ink-900 px-2">
            <LockIcon className="h-3 w-3 shrink-0 text-merged/70" />
            <span className="truncate font-mono text-[11px] text-fg-muted">{url}</span>
          </div>

          {onDeviceChange ? (
            <div className="flex items-center gap-0.5 rounded-md border border-ink-700 bg-ink-900 p-0.5">
              {(['desktop', 'mobile'] as const).map((option) => {
                const Icon = option === 'desktop' ? DesktopIcon : MobileIcon
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onDeviceChange(option)}
                    title={option === 'desktop' ? 'Desktop viewport' : 'Mobile viewport'}
                    className={cn(
                      'rounded p-1 transition',
                      device === option
                        ? 'bg-ink-700 text-fg'
                        : 'text-fg-faint hover:text-fg-muted',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

        <ScaledViewport
          key={reloadKey}
          device={device}
          virtualHeight={virtualHeight}
          height={height}
        >
          {children}
        </ScaledViewport>

        {footer ? (
          <div className="flex items-center justify-between gap-3 border-t border-ink-700 bg-ink-800/70 px-3 py-2">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
