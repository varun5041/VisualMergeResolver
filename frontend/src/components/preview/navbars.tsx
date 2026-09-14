import { cn } from '../../lib/utils'
import { CkLogo, GanpatiMark } from './marks'
import { NotificationMenu, ProfileMenu } from './menus'
import { DonateButton, FestivalStrip, MobileNav, NavLinks } from './navbarParts'

/**
 * Three running versions of src/components/Navbar.tsx — Branch A, Branch B and
 * the composed result. This is the component the merge conflict is about.
 */

/** ganpati-theme: animated festival navbar, Ganpati logo, mobile navigation. */
export function NavbarA({ compact = false }: { compact?: boolean }) {
  return (
    <header className="relative z-50">
      <FestivalStrip compact={compact} />
      <div className="relative border-b border-amber-200/70 bg-[#fffaf1]">
        <div className="pointer-events-none absolute -top-6 left-10 h-28 w-52 rounded-full bg-amber-300/25 blur-3xl" />
        <div
          className={cn(
            'relative mx-auto flex max-w-[1180px] items-center justify-between px-6',
            compact ? 'h-16' : 'h-[76px]',
          )}
        >
          <GanpatiMark size={compact ? 34 : 42} compact={compact} />

          {compact ? (
            <MobileNav accent="amber" />
          ) : (
            <>
              <NavLinks active="Home" accent="amber" />
              <DonateButton variant="festival" />
            </>
          )}
        </div>
        <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 opacity-70" />
      </div>
    </header>
  )
}

/** navbar-feature: notification menu, profile menu, wider navbar spacing. */
export function NavbarB({ compact = false }: { compact?: boolean }) {
  return (
    <header className="relative z-50 border-b border-slate-200 bg-white">
      <div
        className={cn(
          'mx-auto flex max-w-[1180px] items-center justify-between px-8',
          compact ? 'h-16' : 'h-[84px]',
        )}
      >
        <CkLogo size={compact ? 32 : 38} compact={compact} />

        {compact ? (
          <div className="flex items-center gap-1">
            <NotificationMenu />
            <ProfileMenu />
          </div>
        ) : (
          <>
            <NavLinks active="Home" spaced />
            <div className="flex items-center gap-2">
              <NotificationMenu />
              <ProfileMenu />
            </div>
          </>
        )}
      </div>
    </header>
  )
}

/**
 * The merged navbar: festival shell, logo treatment and mobile navigation from
 * Branch A; notification and profile menus plus wider spacing from Branch B.
 */
export function NavbarMerged({ compact = false }: { compact?: boolean }) {
  return (
    <header className="relative z-50">
      <FestivalStrip compact={compact} />
      <div className="relative border-b border-amber-200/70 bg-[#fffaf1]">
        <div className="pointer-events-none absolute -top-6 left-10 h-28 w-52 rounded-full bg-amber-300/25 blur-3xl" />
        <div
          className={cn(
            'relative mx-auto flex max-w-[1180px] items-center justify-between px-8',
            compact ? 'h-16' : 'h-[84px]',
          )}
        >
          <GanpatiMark size={compact ? 34 : 42} compact={compact} />

          {compact ? (
            <div className="flex items-center gap-1">
              <NotificationMenu accent="amber" />
              <ProfileMenu accent="amber" />
              <MobileNav accent="amber" />
            </div>
          ) : (
            <>
              <NavLinks active="Home" spaced accent="amber" />
              <div className="flex items-center gap-3">
                <NotificationMenu accent="amber" />
                <ProfileMenu accent="amber" />
                <DonateButton variant="festival" />
              </div>
            </>
          )}
        </div>
        <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 opacity-70" />
      </div>
    </header>
  )
}
