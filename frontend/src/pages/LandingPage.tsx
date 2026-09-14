import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  GitMergeIcon,
  GithubIcon,
  LockIcon,
  ShieldCheckIcon,
  SparkIcon,
} from '../components/Icons'
import { MergeScene } from '../components/MergeScene'
import { Magnetic, Reveal, Tilt } from '../components/motion'
import {
  EASE,
  FULL_MOTION,
  gsap,
  refreshTriggersWhenReady,
  useGSAP,
} from '../lib/motion'
import { cn } from '../lib/utils'

/* ══════════════════════════════════════════════════════════════════
   Primitives
   ══════════════════════════════════════════════════════════════════ */

/** The section label. Rationed: only three appear on the whole page. */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-medium tracking-[0.2em] text-brand-400 uppercase">
      {children}
    </p>
  )
}

function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        'text-[clamp(1.6rem,3.4vw,2.35rem)] leading-[1.15] font-bold tracking-tight text-fg',
        className,
      )}
    >
      {children}
    </h2>
  )
}

const primaryCta =
  'inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-brand-500 px-6 text-[15px] font-semibold text-white transition-colors ' +
  'shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_12px_28px_-12px_rgba(91,131,240,0.75)] ' +
  'hover:bg-brand-400 active:translate-y-px ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400'

const secondaryCta =
  'inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-ink-600 bg-ink-800/60 px-6 text-[15px] font-medium text-fg transition-colors ' +
  'hover:border-ink-500 hover:bg-ink-750 active:translate-y-px ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400'

/* ══════════════════════════════════════════════════════════════════
   1. Hero — asymmetric split
   ══════════════════════════════════════════════════════════════════ */

/**
 * The hero's visual is a real conflict, printed as text.
 *
 * <p>Not a mock browser window built out of grey rectangles: this is the actual
 * thing a developer stares at, which is the whole argument the page makes. It
 * tilts toward the pointer so it reads as an object on the page rather than a
 * flat screenshot.
 */
function ConflictSpecimen() {
  return (
    <Tilt maxTiltDeg={6}>
      <div className="relative">
        <div
          className="pointer-events-none absolute -inset-10 bg-[radial-gradient(ellipse_60%_55%_at_60%_35%,rgba(91,131,240,0.14),transparent)]"
          aria-hidden="true"
        />
        <figure className="relative m-0 overflow-hidden rounded-xl border border-ink-700 bg-ink-900/70">
          <figcaption className="flex items-center gap-3 border-b border-ink-800 px-4 py-2.5">
            <GitMergeIcon className="h-3.5 w-3.5 text-fg-faint" aria-hidden="true" />
            <span className="font-mono text-[11.5px] text-fg-faint">src/components/Header.tsx</span>
            <span className="ml-auto font-mono text-[11px] text-danger">1 conflict</span>
          </figcaption>
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.75] text-fg-muted">
            <code>
              <span className="text-branch-a">{'<<<<<<< HEAD\n'}</span>
              {'<Header\n  layout="compact"\n  actions={<UserMenu />}\n/>\n'}
              <span className="text-fg-faint">{'=======\n'}</span>
              {'<Header\n  layout="full"\n  actions={<Search /><Alerts />}\n/>\n'}
              <span className="text-branch-b">{'>>>>>>> feature/header-v2'}</span>
            </code>
          </pre>
        </figure>

        {/* The question the markers cannot answer. */}
        <div className="relative mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-ink-700 bg-ink-850/70 px-4 py-3.5">
          <EyeIcon className="h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
          <p className="text-[13.5px] text-fg-muted">
            Which one is the header your users should actually see?
          </p>
        </div>
      </div>
    </Tilt>
  )
}

function Hero() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia(scope)

      media.add(FULL_MOTION, () => {
        // On load, in reading order. The eyebrow, headline, copy and buttons
        // arrive in the order you would read them, and the specimen follows,
        // because the argument has to land before the evidence.
        const intro = gsap.timeline({ defaults: { ease: EASE, duration: 0.7 } })
        intro
          .from('[data-hero="copy"] > *', { opacity: 0, y: 22, stagger: 0.09 })
          .from('[data-hero="visual"]', { opacity: 0, y: 28, scale: 0.98 }, '-=0.45')

        // A slow drift as the page scrolls away. Small on purpose: enough to
        // give the two columns depth, not enough to notice as an effect.
        const drift = gsap.to('[data-hero="visual"]', {
          yPercent: -9,
          ease: 'none',
          scrollTrigger: {
            trigger: scope.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })

        return () => {
          intro.kill()
          drift.kill()
        }
      })

      return () => media.revert()
    },
    { scope },
  )

  return (
    <section ref={scope} className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_25%_0%,rgba(91,131,240,0.13),transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 pt-16 pb-20 md:pt-24 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div data-hero="copy">
          <Eyebrow>The visual merge layer</Eyebrow>

          <h1 className="mt-5 text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.06] font-bold tracking-[-0.02em] text-fg">
            Stop reading merge conflicts.
            <br />
            <span className="text-brand-400">Start seeing them.</span>
          </h1>

          <p className="mt-5 max-w-[46ch] text-[clamp(0.98rem,1.6vw,1.1rem)] leading-relaxed text-fg-muted">
            Compare what each branch actually looks like, say which parts to keep, and merge a
            result you have already seen.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Link to="/login" className={primaryCta}>
                <GithubIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                Continue with GitHub
              </Link>
            </Magnetic>
            <a href="#how-it-works" className={secondaryCta}>
              See how it works
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div data-hero="visual">
          <ConflictSpecimen />
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   2. The problem — two-column contrast
   ══════════════════════════════════════════════════════════════════ */

const GIT_SHOWS = [
  'Line-level, so a whole redesign reads as a wall of noise',
  'No indication of what either version renders as',
  'Correctness is guessed, then found out in review',
]

const VISUALMERGE_SHOWS = [
  'Component-level, so you judge the thing users touch',
  'Each branch builds and renders as a real page',
  'The merged build is verified before anything is committed',
]

function TheProblem() {
  return (
    <section id="product" className="border-t border-white/[0.05]">
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:py-24">
        <Reveal as="div" className="max-w-[54ch]">
          <SectionTitle>
            Git tells you which lines disagree. It never tells you which result is right.
          </SectionTitle>
          <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
            Conflict markers describe an edit. The decision you are actually making is about the
            product: which navigation, which layout, which behaviour ships.
          </p>
        </Reveal>

        <Reveal
          as="div"
          stagger={0.12}
          className="mt-12 grid gap-px overflow-hidden rounded-xl border border-ink-700 bg-ink-700 md:grid-cols-2"
        >
          <div className="group bg-ink-900/80 p-6 transition-colors hover:bg-ink-900">
            <p className="font-mono text-[11.5px] tracking-[0.14em] text-danger uppercase">
              What Git shows you
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-fg">
              Two blocks of text and a marker between them.
            </p>
            <ul className="mt-5 space-y-2.5">
              {GIT_SHOWS.map((line) => (
                <li key={line} className="flex gap-3 text-[13.5px] leading-relaxed text-fg-muted">
                  <span
                    className="mt-2.5 h-px w-3 shrink-0 bg-ink-500 transition-[width] duration-300 group-hover:w-5"
                    aria-hidden="true"
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="group bg-ink-900/80 p-6 transition-colors hover:bg-ink-900">
            <p className="font-mono text-[11.5px] tracking-[0.14em] text-merged uppercase">
              What VisualMerge shows you
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-fg">
              Both branches running, side by side, and the result before you take it.
            </p>
            <ul className="mt-5 space-y-2.5">
              {VISUALMERGE_SHOWS.map((line) => (
                <li key={line} className="flex gap-3 text-[13.5px] leading-relaxed text-fg-muted">
                  <CheckIcon
                    className="mt-1 h-3.5 w-3.5 shrink-0 text-merged transition-transform duration-300 group-hover:scale-110"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   3. How it works — rail that fills with scroll progress
   ══════════════════════════════════════════════════════════════════ */

const STEPS = [
  {
    title: 'Sign in with GitHub',
    body: 'VisualMerge reads the repositories your account already has access to. There is nothing to import and no demo workspace.',
  },
  {
    title: 'Pick a repository and two branches',
    body: 'Repositories, branches and default branches all come live from GitHub, so the list is exactly what you would see there.',
  },
  {
    title: 'See both versions running',
    body: 'Each branch builds and renders as a page you can click through, next to the base branch it is merging into.',
  },
  {
    title: 'Say what the result should be',
    body: 'Keep the navigation from one branch and the layout from the other. VisualMerge resolves the code to match that choice.',
  },
  {
    title: 'Verify, then merge',
    body: 'The merged build is tested and rendered before it becomes a commit. Nothing lands without your approval.',
  },
]

function HowItWorks() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia(scope)

      media.add(FULL_MOTION, () => {
        // The rail fills as you read, so scroll position doubles as a progress
        // indicator through the five steps.
        const fill = gsap.fromTo(
          '[data-rail-fill]',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '[data-rail]',
              start: 'top 70%',
              end: 'bottom 80%',
              scrub: 0.8,
            },
          },
        )

        // Each step arrives just before its marker is reached.
        const steps = gsap.from('[data-step]', {
          opacity: 0,
          x: -18,
          duration: 0.55,
          ease: EASE,
          stagger: 0.12,
          scrollTrigger: { trigger: '[data-rail]', start: 'top 75%' },
        })

        return () => {
          fill.kill()
          steps.kill()
        }
      })

      return () => media.revert()
    },
    { scope },
  )

  return (
    <section
      ref={scope}
      id="how-it-works"
      className="border-t border-white/[0.05] bg-ink-900/30"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:py-24">
        <Reveal as="div" className="max-w-[46ch]">
          <SectionTitle>From two branches to one verified result</SectionTitle>
        </Reveal>

        <ol data-rail className="relative mt-12 max-w-[760px]">
          {/* The rail track and the part of it you have read. */}
          <span
            className="absolute top-5 bottom-10 left-[17px] w-px bg-ink-700 sm:left-[19px]"
            aria-hidden="true"
          />
          <span
            data-rail-fill
            className="absolute top-5 bottom-10 left-[17px] w-px origin-top bg-gradient-to-b from-brand-400 to-merged sm:left-[19px]"
            aria-hidden="true"
          />

          {STEPS.map((step, index) => (
            <li key={step.title} data-step className="relative flex gap-5 pb-9 last:pb-0 sm:gap-7">
              <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink-600 bg-ink-900 font-mono text-[12.5px] font-semibold text-brand-400 transition-colors duration-300 hover:border-brand-400 sm:h-10 sm:w-10">
                {index + 1}
              </span>
              <div className="pt-1.5">
                <h3 className="text-[15.5px] font-semibold text-fg">{step.title}</h3>
                <p className="mt-1.5 max-w-[58ch] text-[13.5px] leading-relaxed text-fg-muted">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   5. Where the product is — grouped status list
   ══════════════════════════════════════════════════════════════════ */

const SHIPPED = [
  'GitHub sign-in, with your GitHub account as your VisualMerge identity',
  'Your real repositories and branches, read live from GitHub',
  'Merge sessions saved to a hosted MySQL database and kept across sign-ins',
]

const IN_PROGRESS = [
  'Building both branches and rendering them side by side',
  'Component-level conflict detection',
  'Describing the result you want, and verified merges',
]

/**
 * An honest status section.
 *
 * <p>The visual engine is not built yet, and a landing page that implies
 * otherwise would be the same lie as a demo repository. Saying so costs nothing
 * and is the difference between a product and a mockup.
 */
function WhereItIs() {
  return (
    <section className="border-t border-white/[0.05] bg-ink-900/30">
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:py-24">
        <Reveal as="div" className="max-w-[50ch]">
          <SectionTitle>Where VisualMerge actually is</SectionTitle>
          <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
            The identity and repository layer is live today. The visual engine is the next piece.
          </p>
        </Reveal>

        <Reveal as="div" stagger={0.14} className="mt-12 grid gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <div className="flex items-center gap-2.5 border-b border-ink-700 pb-3">
              <CheckIcon className="h-4 w-4 text-merged" strokeWidth={3} aria-hidden="true" />
              <h3 className="text-[14px] font-semibold text-fg">Working now</h3>
            </div>
            <ul className="mt-4 space-y-3.5">
              {SHIPPED.map((item) => (
                <li key={item} className="text-[13.5px] leading-relaxed text-fg-muted">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2.5 border-b border-ink-700 pb-3">
              <SparkIcon className="h-4 w-4 text-brand-400" aria-hidden="true" />
              <h3 className="text-[14px] font-semibold text-fg">Being built</h3>
            </div>
            <ul className="mt-4 space-y-3.5">
              {IN_PROGRESS.map((item) => (
                <li key={item} className="text-[13.5px] leading-relaxed text-fg-faint">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   6. Principles — offset two-column
   ══════════════════════════════════════════════════════════════════ */

const PRINCIPLES = [
  {
    icon: ShieldCheckIcon,
    title: 'Nothing merges without you',
    body: 'VisualMerge proposes a resolution and verifies it. Taking it is always an explicit action, never a side effect of opening a page.',
  },
  {
    icon: LockIcon,
    title: 'Your GitHub token stays on the server',
    body: 'The browser holds a session cookie and nothing else. Access is re-checked against GitHub on every request, so revoking VisualMerge on GitHub revokes it here.',
  },
  {
    icon: EyeIcon,
    title: 'No invented data, anywhere',
    body: 'Every repository, branch, session and count is read from GitHub or from the database. When there is nothing yet, the screen says so instead of filling itself in.',
  },
]

function Principles() {
  return (
    <section id="features" className="border-t border-white/[0.05]">
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <Reveal as="div">
            <Eyebrow>Principles</Eyebrow>
            <SectionTitle className="mt-5">
              A merge tool has to be trustworthy before it is clever
            </SectionTitle>
          </Reveal>

          <Reveal as="div" stagger={0.1} className="divide-y divide-ink-700">
            {PRINCIPLES.map((principle) => (
              <div
                key={principle.title}
                className="group flex gap-5 py-6 first:pt-0 last:pb-0"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-ink-700 bg-ink-900 text-fg-muted transition-[color,border-color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:border-brand-400/40 group-hover:text-brand-400">
                  <principle.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-fg">{principle.title}</h3>
                  <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-fg-muted">
                    {principle.body}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   7. Close
   ══════════════════════════════════════════════════════════════════ */

function Close() {
  return (
    <section className="border-t border-white/[0.05] bg-ink-900/30">
      <Reveal as="div" className="mx-auto max-w-[640px] px-5 py-20 text-center md:py-28">
        <h2 className="text-[clamp(1.6rem,3.4vw,2.35rem)] leading-[1.15] font-bold tracking-tight text-fg">
          Your merge conflict should not be a puzzle.
        </h2>
        <p className="mx-auto mt-4 max-w-[44ch] text-[15.5px] leading-relaxed text-fg-muted">
          Sign in with GitHub and VisualMerge is looking at your real repositories within seconds.
        </p>
        <div className="mt-8 flex justify-center">
          <Magnetic>
            <Link to="/login" className={primaryCta}>
              <GithubIcon className="h-[18px] w-[18px]" aria-hidden="true" />
              Continue with GitHub
            </Link>
          </Magnetic>
        </div>
      </Reveal>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════ */

export function LandingPage() {
  // Fonts and images settle after ScrollTrigger has measured, which would
  // otherwise leave the pinned scene starting at the wrong scroll position.
  useGSAP(() => refreshTriggersWhenReady(), [])

  return (
    <div className="overflow-hidden">
      <Hero />
      <TheProblem />
      <HowItWorks />
      <MergeScene />
      <WhereItIs />
      <Principles />
      <Close />
    </div>
  )
}
