import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { VisualMergeMark } from '../components/AppShell'
import { CloseIcon, MenuIcon } from '../components/Icons'
import { cn } from '../lib/utils'

const navLinks = [
  { label: 'Product', href: '/#product' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Features', href: '/#features' },
  { label: 'GitHub', href: 'https://github.com', external: true },
]

function NavLink({ label, href, external, onClick }: { label: string; href: string; external?: boolean; onClick?: () => void }) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-[13.5px] text-fg-muted transition hover:text-fg"
        onClick={onClick}
      >
        {label}
      </a>
    )
  }
  return (
    <a
      href={href}
      className="text-[13.5px] text-fg-muted transition hover:text-fg"
      onClick={onClick}
    >
      {label}
    </a>
  )
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isLanding = location.pathname === '/'

  return (
    <div className="min-h-screen bg-ink-950">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <VisualMergeMark size={28} />
            <span className="text-[15px] font-semibold tracking-tight text-fg">VisualMerge</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.label} {...link} />
            ))}
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="text-[13.5px] font-medium text-fg-muted transition hover:text-fg"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className={cn(
                'inline-flex h-9 items-center rounded-lg px-4 text-[13.5px] font-medium transition',
                'bg-brand-500 text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_6px_18px_-8px_rgba(91,131,240,0.8)]',
                'hover:bg-brand-400',
              )}
            >
              Get started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg text-fg-muted transition hover:bg-ink-800 hover:text-fg md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/[0.06] bg-ink-950/95 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-1 px-5 py-4">
              {navLinks.map((link) => (
                <NavLink key={link.label} {...link} onClick={() => setMobileMenuOpen(false)} />
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-ink-800 pt-3">
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-[13.5px] font-medium text-fg-muted transition hover:bg-ink-800 hover:text-fg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-500 px-3 py-2 text-center text-[13.5px] font-medium text-white transition hover:bg-brand-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── Main ── */}
      <main>{children}</main>

      {/* ── Footer ── */}
      {isLanding && (
        <footer className="border-t border-white/[0.06] bg-ink-950">
          <div className="mx-auto max-w-[1200px] px-5 py-12">
            <div className="grid gap-10 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2.5">
                  <VisualMergeMark size={24} />
                  <span className="text-[14px] font-semibold text-fg">VisualMerge</span>
                </div>
                <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-fg-muted">
                  Resolve conflicts by seeing the result, not reading the diff. Built for AI-assisted development teams.
                </p>
              </div>
              <div>
                <h4 className="text-[12px] font-semibold tracking-wide text-fg-faint uppercase">Product</h4>
                <ul className="mt-3 space-y-2">
                  {['How it works', 'Features', 'Pricing', 'Changelog'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-[13px] text-fg-muted transition hover:text-fg">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[12px] font-semibold tracking-wide text-fg-faint uppercase">Company</h4>
                <ul className="mt-3 space-y-2">
                  {['About', 'Blog', 'GitHub', 'Contact'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-[13px] text-fg-muted transition hover:text-fg">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ink-800 pt-6 sm:flex-row">
              <p className="text-[12px] text-fg-faint">© 2026 VisualMerge. All rights reserved.</p>
              <div className="flex gap-5">
                {['Privacy', 'Terms', 'Security'].map((item) => (
                  <a key={item} href="#" className="text-[12px] text-fg-faint transition hover:text-fg-muted">{item}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
