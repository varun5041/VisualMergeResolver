import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../lib/utils'
import { CloseIcon } from './Icons'

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative flex max-h-[86vh] w-full max-w-2xl animate-fade-up flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-850 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)]',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-700 px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-fg">{title}</h2>
            {subtitle ? <div className="mt-1 text-[13px] text-fg-muted">{subtitle}</div> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-fg-faint transition hover:bg-ink-800 hover:text-fg"
            aria-label="Close"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-slim flex-1 overflow-y-auto">{children}</div>

        {footer ? (
          <div className="flex items-center justify-end gap-2.5 border-t border-ink-700 bg-ink-900/50 px-5 py-3.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
