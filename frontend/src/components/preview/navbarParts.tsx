import { useState } from 'react'
import { cn } from '../../lib/utils'
import { CloseIcon, HeartIcon, MenuIcon } from '../Icons'
import { ToranGarland } from './marks'

export const navLinks = ['Home', 'Causes', 'Donate', 'About'] as const

/** Branch A's festival announcement strip and garland decoration. */
export function FestivalStrip({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600">
      <ToranGarland />
      <div
        className={cn(
          'relative mx-auto flex max-w-[1180px] items-center justify-center gap-2 px-6 text-center',
          compact ? 'h-9 text-[11px]' : 'h-10 text-[12.5px]',
        )}
      >
        <span className="font-medium tracking-wide text-amber-50">
          Ganesh Chaturthi 2026 · every donation matched up to ₹5,00,000
        </span>
        {!compact ? (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white">
            10 days left
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function DonateButton({
  variant = 'plain',
  size = 'md',
  className,
}: {
  variant?: 'festival' | 'plain'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-semibold text-white transition active:scale-[0.98]',
        size === 'sm' && 'px-4 py-2 text-[13px]',
        size === 'md' && 'px-5 py-2.5 text-[14px]',
        size === 'lg' && 'px-7 py-3.5 text-[16px]',
        variant === 'festival'
          ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_10px_24px_-10px_rgba(234,88,12,0.9)] hover:from-amber-400 hover:to-orange-500'
          : 'bg-emerald-600 shadow-[0_10px_24px_-12px_rgba(5,150,105,0.9)] hover:bg-emerald-500',
        className,
      )}
    >
      <HeartIcon className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      Donate
    </button>
  )
}

export function NavLinks({
  active = 'Home',
  spaced = false,
  accent = 'emerald',
}: {
  active?: string
  spaced?: boolean
  accent?: 'emerald' | 'amber'
}) {
  return (
    <nav className={cn('flex items-center', spaced ? 'gap-10' : 'gap-7')}>
      {navLinks.map((link) => {
        const isActive = link === active
        return (
          <button
            key={link}
            type="button"
            className={cn(
              'group relative py-2 text-[14.5px] transition-colors',
              isActive ? 'font-semibold text-slate-900' : 'font-medium text-slate-600',
              accent === 'amber' ? 'hover:text-amber-700' : 'hover:text-emerald-700',
            )}
          >
            {link}
            <span
              className={cn(
                'absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full transition-all',
                accent === 'amber' ? 'bg-amber-500' : 'bg-emerald-500',
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
              )}
            />
          </button>
        )
      })}
    </nav>
  )
}

/** Branch A's mobile navigation, reused by the merged result. */
export function MobileNav({
  accent = 'amber',
  extra,
}: {
  accent?: 'emerald' | 'amber'
  extra?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Toggle navigation"
        className={cn(
          'grid h-10 w-10 place-items-center rounded-lg border transition',
          open
            ? 'border-slate-300 bg-slate-100 text-slate-900'
            : 'border-slate-200 text-slate-700 hover:bg-slate-50',
        )}
      >
        {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-20 animate-fade-up border-b border-slate-200 bg-white px-5 py-4 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.5)]">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link}>
                <button
                  type="button"
                  className={cn(
                    'w-full rounded-lg px-3 py-2.5 text-left text-[15px] font-medium text-slate-700 transition',
                    accent === 'amber' ? 'hover:bg-amber-50' : 'hover:bg-emerald-50',
                  )}
                >
                  {link}
                </button>
              </li>
            ))}
          </ul>
          {extra ? <div className="mt-3 border-t border-slate-100 pt-3">{extra}</div> : null}
          <DonateButton
            variant={accent === 'amber' ? 'festival' : 'plain'}
            className="mt-3 w-full justify-center"
          />
        </div>
      ) : null}
    </>
  )
}
