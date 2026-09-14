import { useState } from 'react'
import { useDismissOnOutsideClick } from '../../lib/hooks'
import { cn } from '../../lib/utils'
import { BellIcon, ChevronDownIcon, HeartIcon, UsersIcon } from '../Icons'
import { Avatar } from './marks'

/**
 * The two menus introduced by Branch B (navbar-feature). They are imported by
 * both the Branch B preview and the merged preview — the merged result really
 * is running the same components.
 */

const notifications = [
  {
    id: 1,
    icon: HeartIcon,
    title: 'Your donation was matched',
    body: 'Sunrise Foundation matched ₹2,500 to Flood Relief Kits.',
    time: '4m ago',
    unread: true,
  },
  {
    id: 2,
    icon: UsersIcon,
    title: '3 new supporters joined',
    body: 'School Meal Program reached 68% of its goal.',
    time: '1h ago',
    unread: true,
  },
  {
    id: 3,
    icon: BellIcon,
    title: 'Monthly impact report ready',
    body: 'August 2026 report is available to download.',
    time: 'Yesterday',
    unread: false,
  },
]

export function NotificationMenu({ accent = 'emerald' }: { accent?: 'emerald' | 'amber' }) {
  const [open, setOpen] = useState(false)
  const ref = useDismissOnOutsideClick<HTMLDivElement>(open, () => setOpen(false))
  const accentText = accent === 'amber' ? 'text-amber-600' : 'text-emerald-600'
  const accentBg = accent === 'amber' ? 'bg-amber-50' : 'bg-emerald-50'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100',
          open && 'bg-slate-100 text-slate-900',
        )}
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
          3
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 origin-top-right animate-pop overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-[13px] font-semibold text-slate-900">Notifications</p>
            <button type="button" className={cn('text-[12px] font-medium', accentText)}>
              Mark all read
            </button>
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.map((item) => (
              <li
                key={item.id}
                className="flex cursor-pointer gap-3 border-b border-slate-50 px-4 py-3 transition last:border-0 hover:bg-slate-50"
              >
                <span
                  className={cn(
                    'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full',
                    accentBg,
                    accentText,
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[13px] font-medium text-slate-900">
                    {item.title}
                    {item.unread ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-snug text-slate-500">{item.body}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="block w-full bg-slate-50 px-4 py-2.5 text-center text-[12.5px] font-medium text-slate-600 transition hover:bg-slate-100"
          >
            View all notifications
          </button>
        </div>
      ) : null}
    </div>
  )
}

const profileLinks = ['Your profile', 'My donations', 'Saved causes', 'Settings']

export function ProfileMenu({ accent = 'emerald' }: { accent?: 'emerald' | 'amber' }) {
  const [open, setOpen] = useState(false)
  const ref = useDismissOnOutsideClick<HTMLDivElement>(open, () => setOpen(false))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex items-center gap-1.5 rounded-full py-1 pr-2 pl-1 transition hover:bg-slate-100',
          open && 'bg-slate-100',
        )}
        aria-label="Account menu"
      >
        <Avatar initials="PS" tone={accent === 'amber' ? 'amber' : 'violet'} className="h-8 w-8" />
        <ChevronDownIcon
          className={cn('h-4 w-4 text-slate-500 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-64 origin-top-right animate-pop overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)]">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
            <Avatar
              initials="PS"
              tone={accent === 'amber' ? 'amber' : 'violet'}
              className="h-10 w-10 text-sm"
            />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold text-slate-900">Priya Sharma</p>
              <p className="truncate text-[12px] text-slate-500">priya@causekind.org</p>
            </div>
          </div>
          <ul className="py-1.5">
            {profileLinks.map((link) => (
              <li key={link}>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-[13px] text-slate-700 transition hover:bg-slate-50"
                >
                  {link}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 py-1.5">
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-[13px] font-medium text-rose-600 transition hover:bg-rose-50"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
