import { cn, formatInr } from '../../lib/utils'
import { ArrowRightIcon, HeartIcon, ShieldCheckIcon, UsersIcon } from '../Icons'
import { CkLogo } from './marks'

const causes = [
  {
    id: 'floods',
    title: 'Flood relief kits for Konkan villages',
    location: 'Ratnagiri, Maharashtra',
    raised: 842_000,
    goal: 1_200_000,
    supporters: 1_284,
    banner: 'from-sky-400 via-cyan-500 to-teal-600',
  },
  {
    id: 'meals',
    title: 'One hot meal a day for 400 students',
    location: 'Pune, Maharashtra',
    raised: 1_360_000,
    goal: 2_000_000,
    supporters: 2_913,
    banner: 'from-amber-400 via-orange-500 to-rose-500',
  },
  {
    id: 'shelter',
    title: 'Monsoon shelter for street dogs',
    location: 'Nashik, Maharashtra',
    raised: 388_000,
    goal: 700_000,
    supporters: 742,
    banner: 'from-violet-400 via-purple-500 to-indigo-600',
  },
]

export function CausesSection({
  compact = false,
  accent = 'emerald',
}: {
  compact?: boolean
  accent?: 'emerald' | 'amber'
}) {
  const amber = accent === 'amber'
  return (
    <section className="bg-white px-8 py-14">
      <div className="mx-auto max-w-[1180px]">
        <div
          className={cn(
            'flex items-end justify-between gap-6',
            compact && 'flex-col items-start gap-3',
          )}
        >
          <div>
            <p
              className={cn(
                'text-[12.5px] font-semibold tracking-[0.14em] uppercase',
                amber ? 'text-amber-600' : 'text-emerald-600',
              )}
            >
              Live campaigns
            </p>
            <h2
              className={cn(
                'mt-2 font-semibold tracking-tight text-slate-900',
                compact ? 'text-[24px]' : 'text-[32px]',
              )}
            >
              Causes that need you this week
            </h2>
          </div>
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-1.5 text-[14px] font-semibold transition',
              amber ? 'text-amber-700 hover:text-amber-800' : 'text-emerald-700 hover:text-emerald-800',
            )}
          >
            View all 128 causes
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className={cn('mt-8 grid gap-6', compact ? 'grid-cols-1' : 'grid-cols-3')}>
          {causes.map((cause) => {
            const percent = Math.round((cause.raised / cause.goal) * 100)
            return (
              <article
                key={cause.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.5)]"
              >
                <div className={cn('relative h-32 bg-gradient-to-br', cause.banner)}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {cause.location}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-[16px] leading-snug font-semibold text-slate-900">
                    {cause.title}
                  </h3>
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full bg-gradient-to-r',
                        amber ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500',
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[12.5px]">
                    <span className="font-semibold text-slate-900">
                      {formatInr(cause.raised)}
                      <span className="ml-1 font-normal text-slate-400">
                        of {formatInr(cause.goal)}
                      </span>
                    </span>
                    <span className={cn('font-semibold', amber ? 'text-amber-600' : 'text-emerald-600')}>
                      {percent}%
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                      <UsersIcon className="h-4 w-4" />
                      {cause.supporters.toLocaleString('en-IN')} supporters
                    </span>
                    <button
                      type="button"
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition',
                        amber
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400'
                          : 'bg-emerald-600 hover:bg-emerald-500',
                      )}
                    >
                      <HeartIcon className="h-3.5 w-3.5" />
                      Give
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function TrustStrip({ accent = 'emerald' }: { accent?: 'emerald' | 'amber' }) {
  const amber = accent === 'amber'
  const stats = [
    { label: 'Raised since 2019', value: '₹41.8 Cr' },
    { label: 'Verified NGOs', value: '312' },
    { label: 'Average payout time', value: '36 hrs' },
    { label: 'Donor trust score', value: '4.9 / 5' },
  ]
  return (
    <section className={cn('px-8 py-10', amber ? 'bg-amber-50/60' : 'bg-slate-50')}>
      <div className="mx-auto grid max-w-[1180px] grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-mono text-[26px] font-semibold tracking-tight text-slate-900">
              {stat.value}
            </p>
            <p className="mt-1 text-[12.5px] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Footer — the change both branches made here applied cleanly. */
export function SiteFooter({ compact = false }: { compact?: boolean }) {
  const columns = [
    { title: 'Platform', links: ['Browse causes', 'Start a fundraiser', 'For NGOs', 'Impact reports'] },
    { title: 'Company', links: ['About CauseKind', 'Careers', 'Press kit', 'Contact'] },
    { title: 'Trust', links: ['How we verify', 'Fee breakdown', 'Privacy', 'Terms'] },
  ]

  return (
    <footer className="border-t border-slate-200 bg-slate-900 px-8 py-12 text-slate-300">
      <div className="mx-auto max-w-[1180px]">
        <div className={cn('grid gap-10', compact ? 'grid-cols-1' : 'grid-cols-[1.3fr_repeat(3,1fr)]')}>
          <div>
            <div className="[&_span]:!text-white">
              <CkLogo size={34} />
            </div>
            <p className="mt-4 max-w-[280px] text-[13px] leading-relaxed text-slate-400">
              CauseKind connects everyday donors to verified grassroots causes, with receipts for
              every rupee.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-[12px] text-slate-300">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
              80G verified · FCRA compliant
            </span>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-[12.5px] font-semibold tracking-[0.12em] text-white uppercase">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      className="text-[13.5px] text-slate-400 transition hover:text-white"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex items-center justify-between border-t border-slate-800 pt-6 text-[12.5px] text-slate-500">
          <span>© 2026 CauseKind Foundation</span>
          <span>Made in Pune, India</span>
        </div>
      </div>
    </footer>
  )
}
