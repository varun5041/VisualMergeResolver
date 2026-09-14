import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { VisualMergeMark } from '../components/Logo'
import { CloseIcon, GithubIcon, MenuIcon } from '../components/Icons'
import { cn } from '../lib/utils'

/** Anchors that exist on the landing page. Nothing here is a dead link. */
const navLinks = [
  { label: 'The problem', href: '/#product' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Principles', href: '/#features' },
]

/**
 * One CTA label for one intent.
 *
 * The nav, the hero and the closing section all say the same thing, because
 * there is exactly one way into the product.
 */
const CTA_LABEL = 'Continue with GitHub'

export function PublicLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isLanding = location.pathname === '/'

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-5">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <VisualMergeMark size={28} />
            <span className="text-[15px] font-semibold tracking-tight text-fg">VisualMerge</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13.5px] whitespace-nowrap text-fg-muted transition hover:text-fg"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Link
            to="/login"
            className={cn(
              'hidden h-9 shrink-0 items-center gap-2 rounded-lg px-4 text-[13.5px] font-medium whitespace-nowrap transition md:inline-flex',
              'bg-brand-500 text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_6px_18px_-8px_rgba(91,131,240,0.8)]',
              'hover:bg-brand-400 active:translate-y-px',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
            )}
          >
            <GithubIcon className="h-4 w-4" aria-hidden="true" />
            {CTA_LABEL}
          </Link>

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg text-fg-muted transition hover:bg-ink-800 hover:text-fg md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/[0.06] bg-ink-950/95 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-1 px-5 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-[13.5px] text-fg-muted transition hover:bg-ink-800 hover:text-fg"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 text-[13.5px] font-medium text-white transition hover:bg-brand-400"
              >
                <GithubIcon className="h-4 w-4" aria-hidden="true" />
                {CTA_LABEL}
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      {isLanding && (
        <footer className="border-t border-white/[0.06] bg-ink-950">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <VisualMergeMark size={22} />
              <span className="text-[13.5px] font-semibold text-fg">VisualMerge</span>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[13px] text-fg-muted transition hover:text-fg"
                >
                  {link.label}
                </a>
              ))}
              <Link to="/login" className="text-[13px] text-fg-muted transition hover:text-fg">
                Sign in
              </Link>
            </nav>
          </div>
        </footer>
      )}
    </div>
  )
}
