import type { ReactNode } from 'react'
import type { ComponentKey, Variant } from '../../types'
import { HeroA, HeroB, HeroMerged } from './heroes'
import { NavbarA, NavbarB, NavbarMerged } from './navbars'
import { CausesSection, SiteFooter, TrustStrip } from './sections'

const navbars = { BRANCH_A: NavbarA, BRANCH_B: NavbarB, MERGED: NavbarMerged }
const heroes = { BRANCH_A: HeroA, BRANCH_B: HeroB, MERGED: HeroMerged }

const highlightLabels: Record<ComponentKey, string> = {
  navbar: 'Navbar',
  hero: 'Hero Section',
  footer: 'Footer',
}

/** Draws an inspector-style outline around the component under discussion. */
function Highlight({
  active,
  component,
  children,
}: {
  active: boolean
  component: ComponentKey
  children: ReactNode
}) {
  if (!active) return <>{children}</>
  return (
    <div className="relative z-10 outline-2 -outline-offset-2 outline-dashed outline-sky-500/70">
      <span className="absolute top-0 left-0 z-20 rounded-br-md bg-sky-500 px-2 py-1 text-[11px] font-semibold tracking-wide text-white">
        {highlightLabels[component]}
      </span>
      {children}
    </div>
  )
}

/**
 * The running CauseKind website. Each conflicting component is swapped for the
 * variant produced by a branch — or by the merge — so the previews really are
 * three different builds of the same app.
 */
export function SitePage({
  navbar,
  hero,
  compact = false,
  highlight,
}: {
  navbar: Variant
  hero: Variant
  compact?: boolean
  highlight?: ComponentKey | null
}) {
  const Navbar = navbars[navbar]
  const Hero = heroes[hero]
  const accent = navbar === 'BRANCH_B' ? 'emerald' : 'amber'

  return (
    <div className="min-h-full bg-white font-sans text-slate-900 antialiased">
      <Highlight active={highlight === 'navbar'} component="navbar">
        <Navbar compact={compact} />
      </Highlight>
      <Highlight active={highlight === 'hero'} component="hero">
        <Hero compact={compact} />
      </Highlight>
      <TrustStrip accent={accent} />
      <CausesSection compact={compact} accent={accent} />
      <Highlight active={highlight === 'footer'} component="footer">
        <SiteFooter compact={compact} />
      </Highlight>
    </div>
  )
}
