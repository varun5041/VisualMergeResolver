import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/utils'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
        'disabled:cursor-not-allowed disabled:opacity-45',
        size === 'sm' && 'h-8 px-3 text-[13px]',
        size === 'md' && 'h-9.5 px-4 text-sm',
        size === 'lg' && 'h-11 px-5 text-[15px]',
        variant === 'primary' &&
          'bg-brand-500 text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_8px_22px_-10px_rgba(91,131,240,0.9)] hover:bg-brand-400',
        variant === 'secondary' &&
          'border border-ink-600 bg-ink-800 text-fg hover:border-ink-500 hover:bg-ink-750',
        variant === 'ghost' && 'text-fg-muted hover:bg-ink-800 hover:text-fg',
        variant === 'danger' && 'border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Panel({
  className,
  children,
  ...props
}: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-ink-700 bg-ink-850/80 backdrop-blur-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function PanelHeader({
  icon,
  title,
  subtitle,
  actions,
  className,
}: {
  icon?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-ink-700 px-5 py-3.5',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon ? <div className="mt-0.5 text-fg-muted">{icon}</div> : null}
        <div>
          <h2 className="text-[15px] leading-tight font-semibold text-fg">{title}</h2>
          {subtitle ? <p className="mt-1 text-[13px] text-fg-muted">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function Chip({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'a' | 'b' | 'merged' | 'danger' | 'warn' | 'brand'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11.5px] font-medium',
        tone === 'neutral' && 'border-ink-600 bg-ink-800 text-fg-muted',
        tone === 'a' && 'border-branch-a/35 bg-branch-a/10 text-branch-a',
        tone === 'b' && 'border-branch-b/35 bg-branch-b/10 text-branch-b',
        tone === 'merged' && 'border-merged/35 bg-merged/10 text-merged',
        tone === 'danger' && 'border-danger/35 bg-danger/10 text-danger',
        tone === 'warn' && 'border-warn/35 bg-warn/10 text-warn',
        tone === 'brand' && 'border-brand-400/35 bg-brand-400/10 text-brand-400',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('font-mono text-[12.5px] tracking-tight', className)}>{children}</span>
}
