import { cn } from '../../lib/utils'

/**
 * Brand marks for the previewed CauseKind site. Everything is inline SVG —
 * the previews are live components, never screenshots.
 */

export function CkLogo({ size = 36, compact = false }: { size?: number; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <defs>
          <linearGradient id="ck-plain" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0e7490" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#ck-plain)" />
        <path
          d="M25.5 15.5a7 7 0 1 0 0 9"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.1"
          strokeLinecap="round"
        />
        <circle cx="27.5" cy="20" r="2" fill="#ffffff" opacity="0.9" />
      </svg>
      <span
        className={cn('font-semibold tracking-tight text-slate-900', compact ? 'text-lg' : 'text-xl')}
      >
        Cause<span className="text-emerald-600">Kind</span>
      </span>
    </div>
  )
}

/** Branch A's festival treatment of the same logo. */
export function GanpatiMark({
  size = 40,
  animated = true,
  compact = false,
}: {
  size?: number
  animated?: boolean
  compact?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative" style={{ width: size, height: size }}>
        {animated ? (
          <span className="absolute inset-0 rounded-[12px] bg-amber-400/45 animate-pulse-ring" />
        ) : null}
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          aria-hidden="true"
          className={cn('relative', animated && 'animate-float')}
        >
          <defs>
            <linearGradient id="ganpati-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f6b63c" />
              <stop offset="55%" stopColor="#ef8f2a" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="11" fill="url(#ganpati-bg)" />
          {/* crown */}
          <path d="M20 5.4l1.7 3.1h-3.4z" fill="#fff8e7" opacity="0.95" />
          <circle cx="20" cy="4.6" r="1" fill="#fff8e7" />
          {/* ears */}
          <ellipse cx="11.8" cy="19" rx="4.6" ry="6.2" fill="#fff8e7" opacity="0.55" />
          <ellipse cx="28.2" cy="19" rx="4.6" ry="6.2" fill="#fff8e7" opacity="0.55" />
          {/* head */}
          <ellipse cx="20" cy="17.6" rx="6.6" ry="7" fill="#fff8e7" />
          {/* eyes */}
          <circle cx="17.6" cy="16.4" r="0.95" fill="#9a3412" />
          <circle cx="22.4" cy="16.4" r="0.95" fill="#9a3412" />
          {/* tilak */}
          <path d="M20 11.4v3" stroke="#c2410c" strokeWidth="1.3" strokeLinecap="round" />
          {/* trunk */}
          <path
            d="M20 21c0 4.4-2.6 5.8-4.1 7.4-1.1 1.2.6 2.6 1.9 1.4"
            fill="none"
            stroke="#fff8e7"
            strokeWidth="2.7"
            strokeLinecap="round"
          />
          {/* tusks */}
          <path d="M16.4 21.6l-1.5 2.2" stroke="#fff8e7" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M23.6 21.6l1.5 2.2" stroke="#fff8e7" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="leading-none">
        <span
          className={cn(
            'font-semibold tracking-tight text-slate-900',
            compact ? 'text-lg' : 'text-xl',
          )}
        >
          Cause<span className="text-amber-600">Kind</span>
        </span>
        <span className="mt-1 block text-[10px] font-semibold tracking-[0.16em] text-amber-700/80 uppercase">
          Utsav Edition
        </span>
      </div>
    </div>
  )
}

/** Hanging garland used as the subtle festival decoration in Branch A. */
export function ToranGarland({ className }: { className?: string }) {
  return (
    <svg
      className={cn('pointer-events-none absolute inset-x-0 top-0 h-6 w-full', className)}
      viewBox="0 0 1280 24"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {Array.from({ length: 32 }).map((_, index) => {
        const x = index * 40 + 20
        return (
          <g key={index} opacity={0.5}>
            <path
              d={`M${x - 20} 0 Q ${x} 13 ${x + 20} 0`}
              fill="none"
              stroke="#d97706"
              strokeWidth="1.4"
            />
            <path
              d={`M${x} 9 l3.4 5.2 -3.4 5.6 -3.4 -5.6z`}
              fill={index % 2 === 0 ? '#f59e0b' : '#15803d'}
              opacity="0.85"
            />
          </g>
        )
      })}
    </svg>
  )
}

export function DiyaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M16 6c1.9 2.4 3 4 3 5.6a3 3 0 0 1-6 0C13 10 14.1 8.4 16 6z"
        fill="#fbbf24"
        className="animate-float"
      />
      <path d="M6 18h20c0 4.4-4.5 7-10 7S6 22.4 6 18z" fill="#b45309" />
      <path d="M6 18h20c0 1.2-.3 2.2-.9 3.2H6.9C6.3 20.2 6 19.2 6 18z" fill="#92400e" />
    </svg>
  )
}

export function Avatar({
  initials,
  className,
  tone = 'violet',
}: {
  initials: string
  className?: string
  tone?: 'violet' | 'amber' | 'emerald'
}) {
  const tones = {
    violet: 'from-violet-500 to-indigo-600',
    amber: 'from-amber-500 to-orange-600',
    emerald: 'from-emerald-500 to-teal-600',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-gradient-to-br text-[12px] font-semibold text-white',
        tones[tone],
        className,
      )}
    >
      {initials}
    </span>
  )
}
