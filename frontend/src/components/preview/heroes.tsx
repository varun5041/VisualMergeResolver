import { useTicker } from '../../lib/hooks'
import { cn, formatInr } from '../../lib/utils'
import { ArrowRightIcon, UsersIcon } from '../Icons'
import { Avatar, DiyaIcon } from './marks'
import { DonateButton } from './navbarParts'

const TICK_RANGE: [number, number] = [180, 950]

/** Branch B's live donation counter, reused by the merged hero. */
export function LiveDonationCounter({ accent = 'emerald' }: { accent?: 'emerald' | 'amber' }) {
  const raised = useTicker(4_812_400, TICK_RANGE, 1800)
  const goal = 6_000_000
  const percent = Math.min(100, Math.round((raised / goal) * 100))
  const amber = accent === 'amber'

  return (
    <div
      className={cn(
        'w-full rounded-2xl border bg-white p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.55)]',
        amber ? 'border-amber-200' : 'border-slate-200',
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-wide uppercase',
            amber ? 'text-amber-700' : 'text-emerald-700',
          )}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse-ring',
                amber ? 'bg-amber-500' : 'bg-emerald-500',
              )}
            />
            <span
              className={cn(
                'relative inline-flex h-2 w-2 rounded-full',
                amber ? 'bg-amber-500' : 'bg-emerald-500',
              )}
            />
          </span>
          Raised live
        </span>
        <span className="text-[12px] text-slate-400">updates every few seconds</span>
      </div>

      <p className="mt-3 font-mono text-[34px] leading-none font-semibold tracking-tight text-slate-900 tabular-nums">
        {formatInr(raised)}
      </p>
      <p className="mt-1.5 text-[13px] text-slate-500">
        of {formatInr(goal)} goal · {percent}% funded
      </p>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            amber
              ? 'bg-gradient-to-r from-amber-400 to-orange-500'
              : 'bg-gradient-to-r from-emerald-400 to-teal-500',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex -space-x-2">
          {[
            { initials: 'RK', tone: 'emerald' as const },
            { initials: 'AM', tone: 'amber' as const },
            { initials: 'SN', tone: 'violet' as const },
          ].map((donor) => (
            <Avatar
              key={donor.initials}
              initials={donor.initials}
              tone={donor.tone}
              className="h-8 w-8 ring-2 ring-white"
            />
          ))}
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 ring-2 ring-white">
            +9k
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
          <UsersIcon className="h-4 w-4" />
          9,241 supporters
        </span>
      </div>
    </div>
  )
}

function FestivalBackdrop() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgba(251,191,36,0.28),transparent),radial-gradient(ellipse_60%_60%_at_85%_10%,rgba(249,115,22,0.22),transparent)]" />
      <div className="pointer-events-none absolute right-10 bottom-8 flex gap-6 opacity-90">
        <DiyaIcon className="h-9 w-9" />
        <DiyaIcon className="h-11 w-11" />
        <DiyaIcon className="h-9 w-9" />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-tr-full bg-amber-200/40 blur-2xl" />
    </>
  )
}

function FestivalChip() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-white/70 px-3.5 py-1.5 text-[12.5px] font-semibold text-amber-800 backdrop-blur">
      <DiyaIcon className="h-4 w-4" />
      Ganesh Chaturthi 2026 campaign
    </span>
  )
}

/** ganpati-theme: festival campaign banner, diya accents, festival copy. */
export function HeroA({ compact = false }: { compact?: boolean }) {
  return (
    <section className="relative overflow-hidden bg-[#fffaf1] px-6 py-16">
      <FestivalBackdrop />
      <div className="relative mx-auto max-w-[860px] text-center">
        <FestivalChip />
        <h1
          className={cn(
            'mt-6 font-semibold tracking-tight text-slate-900',
            compact ? 'text-[30px] leading-[1.15]' : 'text-[54px] leading-[1.06]',
          )}
        >
          Celebrate by giving back this{' '}
          <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Ganesh Chaturthi
          </span>
        </h1>
        <p
          className={cn(
            'mx-auto mt-5 text-slate-600',
            compact ? 'max-w-[320px] text-[14px]' : 'max-w-[560px] text-[17px] leading-relaxed',
          )}
        >
          Every rupee you give this festival season is matched by our partner foundations — and goes
          straight to the families behind each cause.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <DonateButton variant="festival" size={compact ? 'md' : 'lg'} />
        </div>
      </div>
    </section>
  )
}

/** navbar-feature: two-column layout, live counter, secondary CTA. */
export function HeroB({ compact = false }: { compact?: boolean }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-100 bg-white px-8 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_0%,rgba(16,185,129,0.12),transparent)]" />
      <div
        className={cn(
          'relative mx-auto grid max-w-[1180px] items-center gap-12',
          compact ? 'grid-cols-1 gap-8' : 'grid-cols-[1.05fr_0.95fr]',
        )}
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[12.5px] font-semibold text-emerald-700">
            1,240 causes funded this year
          </span>
          <h1
            className={cn(
              'mt-6 font-semibold tracking-tight text-slate-900',
              compact ? 'text-[30px] leading-[1.15]' : 'text-[50px] leading-[1.07]',
            )}
          >
            Fund the causes your community cares about
          </h1>
          <p
            className={cn(
              'mt-5 text-slate-600',
              compact ? 'text-[14px]' : 'max-w-[480px] text-[17px] leading-relaxed',
            )}
          >
            Follow a cause, watch the money land, and get a receipt for every rupee. No middlemen, no
            guesswork.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <DonateButton size={compact ? 'md' : 'lg'} />
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-2 rounded-full border border-slate-300 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50',
                compact ? 'px-5 py-2.5 text-[14px]' : 'px-6 py-3.5 text-[16px]',
              )}
            >
              Browse causes
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <LiveDonationCounter />
      </div>
    </section>
  )
}

/** Festival styling and copy from A, live counter and secondary CTA from B. */
export function HeroMerged({ compact = false }: { compact?: boolean }) {
  return (
    <section className="relative overflow-hidden bg-[#fffaf1] px-8 py-16">
      <FestivalBackdrop />
      <div
        className={cn(
          'relative mx-auto grid max-w-[1180px] items-center gap-12',
          compact ? 'grid-cols-1 gap-8' : 'grid-cols-[1.05fr_0.95fr]',
        )}
      >
        <div>
          <FestivalChip />
          <h1
            className={cn(
              'mt-6 font-semibold tracking-tight text-slate-900',
              compact ? 'text-[30px] leading-[1.15]' : 'text-[50px] leading-[1.07]',
            )}
          >
            Celebrate by giving back this{' '}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Ganesh Chaturthi
            </span>
          </h1>
          <p
            className={cn(
              'mt-5 text-slate-600',
              compact ? 'text-[14px]' : 'max-w-[480px] text-[17px] leading-relaxed',
            )}
          >
            Every rupee you give this festival season is matched by our partner foundations — and goes
            straight to the families behind each cause.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <DonateButton variant="festival" size={compact ? 'md' : 'lg'} />
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-2 rounded-full border border-amber-300 font-semibold text-amber-800 transition hover:border-amber-400 hover:bg-amber-50',
                compact ? 'px-5 py-2.5 text-[14px]' : 'px-6 py-3.5 text-[16px]',
              )}
            >
              Browse causes
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <LiveDonationCounter accent="amber" />
      </div>
    </section>
  )
}
