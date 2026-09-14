import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { VisualMergeMark } from '../components/AppShell'
import {
  ArrowRightIcon,
  BoxIcon,
  CheckIcon,
  CpuIcon,
  EyeIcon,
  GitBranchIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  GlobeIcon,
  ShieldCheckIcon,
  SparkIcon,
  ZapIcon,
} from '../components/Icons'
import { cn } from '../lib/utils'

/* ── Scroll-triggered fade-in hook ── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setVisible(true) },
      { threshold: 0.12 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}

function Section({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const { ref, visible } = useScrollReveal()
  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        'transition-all duration-700',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        className,
      )}
    >
      {children}
    </section>
  )
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/25 bg-brand-400/8 px-3.5 py-1 text-[12px] font-medium tracking-wide text-brand-400 uppercase">
      {children}
    </span>
  )
}

/* ── Animated hero product preview ── */
function HeroPreview() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
      setTimeout(() => setStep(4), 2800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="relative mx-auto mt-12 max-w-[900px]">
      {/* Glow */}
      <div className="pointer-events-none absolute -inset-16 rounded-3xl bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(91,131,240,0.12),transparent)]" />

      {/* Branch previews row */}
      <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr]">
        {/* Branch A */}
        <div
          className={cn(
            'rounded-xl border border-branch-a/25 bg-ink-900/80 p-0.5 transition-all duration-700',
            step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
          )}
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center gap-2 rounded-t-[10px] border-b border-ink-800 bg-ink-900 px-3 py-2">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ink-600" />
              <span className="h-2 w-2 rounded-full bg-ink-600" />
              <span className="h-2 w-2 rounded-full bg-ink-600" />
            </div>
            <span className="flex-1 text-center font-mono text-[10px] text-fg-faint">Branch A</span>
          </div>
          <div className="space-y-2 p-3">
            <div className="h-5 w-full rounded bg-branch-a/15" />
            <div className="h-14 w-full rounded bg-branch-a/8 ring-1 ring-branch-a/20" />
            <div className="grid grid-cols-3 gap-1.5">
              <div className="h-8 rounded bg-ink-800" />
              <div className="h-8 rounded bg-ink-800" />
              <div className="h-8 rounded bg-ink-800" />
            </div>
            <div className="h-4 w-3/4 rounded bg-ink-800" />
          </div>
        </div>

        {/* VS badge */}
        <div className="flex items-center justify-center">
          <span
            className={cn(
              'grid h-10 w-10 place-items-center rounded-full border border-ink-600 bg-ink-900 font-mono text-[13px] font-semibold text-fg-muted transition-all duration-500',
              step >= 1 ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
            )}
          >
            VS
          </span>
        </div>

        {/* Branch B */}
        <div
          className={cn(
            'rounded-xl border border-branch-b/25 bg-ink-900/80 p-0.5 transition-all duration-700',
            step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
          )}
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center gap-2 rounded-t-[10px] border-b border-ink-800 bg-ink-900 px-3 py-2">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ink-600" />
              <span className="h-2 w-2 rounded-full bg-ink-600" />
              <span className="h-2 w-2 rounded-full bg-ink-600" />
            </div>
            <span className="flex-1 text-center font-mono text-[10px] text-fg-faint">Branch B</span>
          </div>
          <div className="space-y-2 p-3">
            <div className="h-5 w-full rounded bg-branch-b/15" />
            <div className="h-14 w-full rounded bg-branch-b/8 ring-1 ring-branch-b/20" />
            <div className="grid grid-cols-2 gap-1.5">
              <div className="h-10 rounded bg-ink-800" />
              <div className="h-10 rounded bg-ink-800" />
            </div>
            <div className="h-4 w-2/3 rounded bg-ink-800" />
          </div>
        </div>
      </div>

      {/* Arrow + instruction */}
      <div
        className={cn(
          'my-5 flex flex-col items-center gap-2 transition-all duration-600',
          step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        <div className="h-6 w-px bg-gradient-to-b from-transparent via-fg-faint to-transparent" />
        <span className="rounded-full border border-ink-700 bg-ink-900 px-4 py-1.5 text-[12px] text-fg-muted">
          Tell us what you want
        </span>
        <div className="h-6 w-px bg-gradient-to-b from-transparent via-fg-faint to-transparent" />
      </div>

      {/* Merged result */}
      <div
        className={cn(
          'rounded-xl border border-merged/25 bg-ink-900/80 p-0.5 transition-all duration-700',
          step >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        <div className="flex items-center gap-2 rounded-t-[10px] border-b border-ink-800 bg-ink-900 px-3 py-2">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-merged/50" />
            <span className="h-2 w-2 rounded-full bg-ink-600" />
            <span className="h-2 w-2 rounded-full bg-ink-600" />
          </div>
          <span className="flex-1 text-center font-mono text-[10px] text-fg-faint">Merged Result</span>
          {step >= 4 && (
            <span className="flex items-center gap-1 rounded-full bg-merged/15 px-2 py-0.5 text-[10px] font-medium text-merged">
              <CheckIcon className="h-3 w-3" strokeWidth={3} />
              Verified
            </span>
          )}
        </div>
        <div className="space-y-2 p-3">
          <div className="h-5 w-full rounded bg-merged/10 ring-1 ring-merged/15" />
          <div className="h-14 w-full rounded bg-merged/6" />
          <div className="grid grid-cols-3 gap-1.5">
            <div className="h-8 rounded bg-ink-800" />
            <div className="h-8 rounded bg-ink-800" />
            <div className="h-8 rounded bg-ink-800" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 flex-1 rounded bg-ink-800" />
            <div className="flex items-center gap-1 text-[10px] text-merged">
              <SparkIcon className="h-3 w-3" />
              AI combined the best of A + B
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Feature cards data ── */
const features = [
  { icon: EyeIcon, title: 'Visual Branch Comparison', description: 'See both branches as running applications, not lines of code.' },
  { icon: SparkIcon, title: 'AI Conflict Resolution', description: 'Describe the result you want. AI resolves the code to match.' },
  { icon: GitBranchIcon, title: 'Real Git Integration', description: 'Works with your actual GitHub repositories and branches.' },
  { icon: GlobeIcon, title: 'Browser Previews', description: 'Each branch renders as a real, interactive web page.' },
  { icon: ShieldCheckIcon, title: 'Visual Verification', description: 'The merged build is checked before anything is committed.' },
  { icon: GitPullRequestIcon, title: 'GitHub PR Workflow', description: 'Create pull requests directly from verified merges.' },
  { icon: BoxIcon, title: 'Isolated Execution', description: 'Every build runs in its own sandboxed environment.' },
  { icon: CheckIcon, title: 'Human Approval', description: 'AI proposes. You approve. Nothing merges without your sign-off.' },
]

const howItWorksSteps = [
  { step: '01', title: 'Connect your repository', description: 'Link a GitHub repository. VisualMerge clones it into an isolated workspace.', icon: GitBranchIcon },
  { step: '02', title: 'See both versions', description: 'Each branch builds and renders as a live web page you can interact with.', icon: EyeIcon },
  { step: '03', title: 'Describe the result you want', description: '"Keep the navbar from A, the cards from B." Tell VisualMerge what to combine.', icon: SparkIcon },
  { step: '04', title: 'Verify the merged application', description: 'The merged build is tested, verified visually, and ready for a PR.', icon: ShieldCheckIcon },
]

/* ── Main landing page ── */
export function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* ═══════════════ HERO ═══════════════ */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(91,131,240,0.14),transparent)]" />
        <div className="mx-auto max-w-[1200px] px-5 pb-20 pt-20 text-center md:pt-28">
          <SectionBadge>The visual merge layer for AI-generated code</SectionBadge>

          <h1 className="mt-6 text-[clamp(2rem,5.5vw,3.75rem)] leading-[1.08] font-extrabold tracking-tight text-fg">
            Stop reading merge conflicts.{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-brand-400 to-[#a78bfa] bg-clip-text text-transparent">
              Start seeing them.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-[600px] text-[clamp(0.95rem,1.8vw,1.12rem)] leading-relaxed text-fg-muted">
            Compare what each branch actually looks like, tell VisualMerge what you want to keep,
            and let AI create a verified merge.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className={cn(
                'inline-flex h-12 items-center gap-2.5 rounded-xl px-6 text-[15px] font-semibold transition',
                'bg-brand-500 text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_12px_28px_-10px_rgba(91,131,240,0.7)]',
                'hover:bg-brand-400 hover:shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_16px_36px_-10px_rgba(91,131,240,0.8)]',
              )}
            >
              Start resolving conflicts
              <ArrowRightIcon className="h-4.5 w-4.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink-600 bg-ink-800/60 px-6 text-[15px] font-medium text-fg transition hover:border-ink-500 hover:bg-ink-750"
            >
              See how it works
            </a>
          </div>

          <HeroPreview />
        </div>
      </div>

      {/* ═══════════════ SECTION 1: THE PROBLEM ═══════════════ */}
      <Section id="product" className="mx-auto max-w-[1200px] px-5 py-24">
        <div className="text-center">
          <SectionBadge>The problem</SectionBadge>
          <h2 className="mt-5 text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight font-bold tracking-tight text-fg">
            Git shows you the conflict.{' '}
            <br className="hidden sm:block" />
            VisualMerge shows you the outcome.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Traditional */}
          <div className="rounded-xl border border-danger/20 bg-ink-900/60 p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-danger" />
              <span className="text-[13px] font-semibold text-danger">Traditional merge conflict</span>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-ink-950 p-4 font-mono text-[12px] leading-relaxed text-fg-muted">
              <code>{`<<<<<<< HEAD
<nav class="navbar-dark">
  <Logo variant="compact" />
  <UserMenu />
</nav>
=======
<nav class="navbar-brand">
  <Logo variant="full" />
  <SearchBar />
  <NotificationBell />
</nav>
>>>>>>> feature/redesign`}</code>
            </pre>
            <p className="mt-3 text-[13px] text-fg-faint">You read code. You guess what it looks like.</p>
          </div>

          {/* VisualMerge */}
          <div className="rounded-xl border border-merged/20 bg-ink-900/60 p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-merged" />
              <span className="text-[13px] font-semibold text-merged">VisualMerge resolution</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Branch A', 'Branch B', 'Merged'].map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    'rounded-lg border p-3',
                    i === 0 && 'border-branch-a/25 bg-branch-a/5',
                    i === 1 && 'border-branch-b/25 bg-branch-b/5',
                    i === 2 && 'border-merged/25 bg-merged/5',
                  )}
                >
                  <div className={cn(
                    'mb-2 h-3 w-full rounded',
                    i === 0 && 'bg-branch-a/20',
                    i === 1 && 'bg-branch-b/20',
                    i === 2 && 'bg-merged/20',
                  )} />
                  <div className="space-y-1.5">
                    <div className="h-6 w-full rounded bg-ink-800" />
                    <div className="h-4 w-3/4 rounded bg-ink-800" />
                    <div className="h-4 w-1/2 rounded bg-ink-800" />
                  </div>
                  <p className={cn(
                    'mt-2 text-center text-[10px] font-medium',
                    i === 0 && 'text-branch-a',
                    i === 1 && 'text-branch-b',
                    i === 2 && 'text-merged',
                  )}>{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[13px] text-fg-faint">You see the result. You approve what you see.</p>
          </div>
        </div>
      </Section>

      {/* ═══════════════ SECTION 2: HOW IT WORKS ═══════════════ */}
      <Section id="how-it-works" className="border-t border-white/[0.04] bg-ink-900/30 py-24">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="text-center">
            <SectionBadge>How it works</SectionBadge>
            <h2 className="mt-5 text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight font-bold tracking-tight text-fg">
              Four steps from conflict to merge
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorksSteps.map((item) => (
              <div key={item.step} className="group rounded-xl border border-ink-700 bg-ink-850/60 p-5 transition hover:border-ink-600 hover:bg-ink-800/60">
                <span className="font-mono text-[28px] font-bold text-brand-400/60">{item.step}</span>
                <div className="mt-3 grid h-10 w-10 place-items-center rounded-lg border border-ink-700 bg-ink-900 text-fg-muted transition group-hover:border-brand-400/30 group-hover:text-brand-400">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-[14px] font-semibold text-fg">{item.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════ SECTION 3: CORE DIFFERENTIATOR ═══════════════ */}
      <Section className="mx-auto max-w-[1200px] px-5 py-24">
        <div className="text-center">
          <SectionBadge>Visual resolution</SectionBadge>
          <h2 className="mt-5 text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight font-bold tracking-tight text-fg">
            Code tells you what changed.{' '}
            <br className="hidden sm:block" />
            The browser tells you what matters.
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[15px] text-fg-muted">
            Select which visual elements to keep from each branch. VisualMerge resolves the code to match your choices.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-ink-700 bg-ink-900/60 p-6">
          <div className="flex items-center gap-2 pb-4 text-[12px] font-semibold text-fg-faint uppercase tracking-wider">
            <EyeIcon className="h-4 w-4" />
            Visual component selection
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { name: 'Navbar', source: 'Branch A', tone: 'a' as const },
              { name: 'Hero', source: 'Combined', tone: 'merged' as const },
              { name: 'Cards', source: 'Branch B', tone: 'b' as const },
              { name: 'Buttons', source: 'Branch A', tone: 'a' as const },
              { name: 'Forms', source: 'Branch B', tone: 'b' as const },
            ].map((item) => (
              <div
                key={item.name}
                className={cn(
                  'rounded-lg border p-3 transition hover:scale-[1.02]',
                  item.tone === 'a' && 'border-branch-a/25 bg-branch-a/5',
                  item.tone === 'b' && 'border-branch-b/25 bg-branch-b/5',
                  item.tone === 'merged' && 'border-merged/25 bg-merged/5',
                )}
              >
                <div className={cn(
                  'h-10 w-full rounded bg-ink-800/60',
                )} />
                <p className="mt-2 text-[12px] font-medium text-fg">{item.name}</p>
                <p className={cn(
                  'text-[11px] font-medium',
                  item.tone === 'a' && 'text-branch-a',
                  item.tone === 'b' && 'text-branch-b',
                  item.tone === 'merged' && 'text-merged',
                )}>{item.source}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════ SECTION 4: AI + HUMAN CONTROL ═══════════════ */}
      <Section className="border-t border-white/[0.04] bg-ink-900/30 py-24">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="text-center">
            <SectionBadge>AI + Human Control</SectionBadge>
            <h2 className="mt-5 text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight font-bold tracking-tight text-fg">
              AI does the merge.{' '}
              <br className="hidden sm:block" />
              You decide the result.
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-[800px] gap-6 lg:grid-cols-2">
            {/* Instruction */}
            <div className="rounded-xl border border-ink-700 bg-ink-850/80 p-5">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-fg-faint uppercase tracking-wider">
                <UserIconSmall />
                Your instruction
              </div>
              <div className="mt-3 rounded-lg border border-ink-600 bg-ink-950 p-3">
                <p className="text-[13px] leading-relaxed text-fg">
                  "Keep the navbar from A, the pricing cards from B, and combine the hero section."
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-brand-400/20 bg-brand-400/8 px-3 py-2">
                <SparkIcon className="h-4 w-4 text-brand-400" />
                <span className="text-[13px] font-medium text-brand-400">Merge plan created</span>
              </div>
            </div>

            {/* Verification */}
            <div className="rounded-xl border border-ink-700 bg-ink-850/80 p-5">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-fg-faint uppercase tracking-wider">
                <ShieldCheckIcon className="h-4 w-4" />
                Verification
              </div>
              <div className="mt-3 space-y-2">
                {[
                  'Applied',
                  'Build passed',
                  'Preview passed',
                  'Visual verification passed',
                ].map((check) => (
                  <div key={check} className="flex items-center gap-2.5 rounded-lg border border-merged/20 bg-merged/6 px-3 py-2">
                    <CheckIcon className="h-4 w-4 text-merged" strokeWidth={3} />
                    <span className="text-[13px] text-fg">{check}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-[600px] text-center">
            <p className="text-[15px] font-medium text-fg">
              AI proposes. You approve. VisualMerge verifies.
            </p>
            <p className="mt-2 text-[13px] text-fg-muted">
              Nothing is merged without your explicit approval and automated verification.
            </p>
          </div>
        </div>
      </Section>

      {/* ═══════════════ SECTION 5: BUILT FOR AI CODING ═══════════════ */}
      <Section className="mx-auto max-w-[1200px] px-5 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionBadge>The AI coding era</SectionBadge>
            <h2 className="mt-5 text-[clamp(1.5rem,3.5vw,2.25rem)] leading-tight font-bold tracking-tight text-fg">
              Built for the way software is written now.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
              AI coding agents generate changes faster than ever. But when multiple agents work in parallel,
              they create merge conflicts that are harder to reason about than human-written code.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
              VisualMerge lets you understand those changes visually — instead of manually reading
              through hundreds of lines of AI-generated diffs.
            </p>
          </div>
          <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-6">
            <div className="space-y-3">
              {[
                { agent: 'Agent 1', action: 'Redesigned navigation component', branch: 'feature/nav-redesign' },
                { agent: 'Agent 2', action: 'Added pricing page with cards', branch: 'feature/pricing' },
                { agent: 'Agent 3', action: 'Refactored shared layout module', branch: 'feature/layout-v2' },
              ].map((item) => (
                <div key={item.agent} className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-850/60 px-4 py-3">
                  <CpuIcon className="h-4 w-4 shrink-0 text-brand-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-fg">{item.action}</p>
                    <p className="truncate font-mono text-[11px] text-fg-faint">{item.branch}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-lg border border-danger/25 bg-danger/8 px-4 py-3">
                <ZapIcon className="h-4 w-4 text-danger" />
                <span className="text-[13px] font-medium text-danger">3 conflicting changes detected</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-merged/25 bg-merged/8 px-4 py-3">
                <GitMergeIcon className="h-4 w-4 text-merged" />
                <span className="text-[13px] font-medium text-merged">VisualMerge resolves them visually</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════ SECTION 6: FEATURE GRID ═══════════════ */}
      <Section id="features" className="border-t border-white/[0.04] bg-ink-900/30 py-24">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="text-center">
            <SectionBadge>Features</SectionBadge>
            <h2 className="mt-5 text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight font-bold tracking-tight text-fg">
              Everything you need to merge with confidence
            </h2>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-ink-700 bg-ink-850/60 p-5 transition hover:border-ink-600 hover:bg-ink-800/40"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg border border-ink-700 bg-ink-900 text-fg-muted transition group-hover:border-brand-400/30 group-hover:text-brand-400">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-[14px] font-semibold text-fg">{feature.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════ SECTION 7: PRODUCT SHOWCASE ═══════════════ */}
      <Section className="mx-auto max-w-[1200px] px-5 py-24">
        <div className="text-center">
          <SectionBadge>The product</SectionBadge>
          <h2 className="mt-5 text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight font-bold tracking-tight text-fg">
            A complete visual merge workspace
          </h2>
        </div>

        <div className="mt-12 rounded-xl border border-ink-700 bg-ink-900/60 p-1">
          {/* Mock toolbar */}
          <div className="flex items-center gap-3 rounded-t-[10px] border-b border-ink-800 bg-ink-900 px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-ink-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-600" />
            </div>
            <div className="flex items-center gap-2">
              <VisualMergeMark size={18} />
              <span className="text-[12px] font-medium text-fg-muted">VisualMerge</span>
              <span className="text-[11px] text-fg-faint">/</span>
              <span className="font-mono text-[12px] text-fg-faint">causekind/causekind-web</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-danger/30 bg-danger/10 px-2 py-0.5 text-[10px] font-medium text-danger">
                2 conflicts
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-merged/30 bg-merged/10 px-2 py-0.5 text-[10px] font-medium text-merged">
                <CheckIcon className="h-2.5 w-2.5" strokeWidth={3} />
                Verified
              </span>
            </div>
          </div>

          {/* Mock product content */}
          <div className="grid gap-3 p-4 lg:grid-cols-[1fr_1fr_280px]">
            {/* Branch A preview */}
            <div className="rounded-lg border border-branch-a/20 bg-ink-900/40 p-3">
              <div className="flex items-center justify-between pb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-branch-a">
                  <GitBranchIcon className="h-3 w-3" />
                  feature/ganpati
                </span>
                <span className="text-[10px] text-fg-faint">Branch A</span>
              </div>
              <div className="space-y-1.5">
                <div className="h-4 w-full rounded bg-branch-a/10" />
                <div className="h-12 w-full rounded bg-ink-800" />
                <div className="grid grid-cols-3 gap-1">
                  <div className="h-6 rounded bg-ink-800" />
                  <div className="h-6 rounded bg-ink-800" />
                  <div className="h-6 rounded bg-ink-800" />
                </div>
              </div>
            </div>

            {/* Branch B preview */}
            <div className="rounded-lg border border-branch-b/20 bg-ink-900/40 p-3">
              <div className="flex items-center justify-between pb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-branch-b">
                  <GitBranchIcon className="h-3 w-3" />
                  feature/donation-flow
                </span>
                <span className="text-[10px] text-fg-faint">Branch B</span>
              </div>
              <div className="space-y-1.5">
                <div className="h-4 w-full rounded bg-branch-b/10" />
                <div className="h-12 w-full rounded bg-ink-800" />
                <div className="grid grid-cols-2 gap-1">
                  <div className="h-8 rounded bg-ink-800" />
                  <div className="h-8 rounded bg-ink-800" />
                </div>
              </div>
            </div>

            {/* Side panel */}
            <div className="space-y-3">
              {/* AI Resolution */}
              <div className="rounded-lg border border-ink-700 bg-ink-850/60 p-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-brand-400">
                  <SparkIcon className="h-3.5 w-3.5" />
                  AI Resolution
                </div>
                <div className="mt-2 space-y-1.5">
                  <div className="h-3 w-full rounded bg-ink-800" />
                  <div className="h-3 w-3/4 rounded bg-ink-800" />
                </div>
              </div>

              {/* Merged preview */}
              <div className="rounded-lg border border-merged/20 bg-merged/5 p-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-merged">
                  <GitMergeIcon className="h-3.5 w-3.5" />
                  Merged Preview
                </div>
                <div className="mt-2 space-y-1.5">
                  <div className="h-4 rounded bg-merged/10" />
                  <div className="h-8 rounded bg-ink-800" />
                </div>
              </div>

              {/* Verification */}
              <div className="rounded-lg border border-ink-700 bg-ink-850/60 p-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-fg-muted">
                  <ShieldCheckIcon className="h-3.5 w-3.5" />
                  Verification
                </div>
                <div className="mt-2 space-y-1">
                  {['Build', 'Preview', 'Visual'].map((check) => (
                    <div key={check} className="flex items-center gap-2 text-[10px]">
                      <CheckIcon className="h-3 w-3 text-merged" strokeWidth={3} />
                      <span className="text-fg-muted">{check} passed</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════ SECTION 8: FINAL CTA ═══════════════ */}
      <section className="border-t border-white/[0.04] bg-ink-900/30 py-24">
        <div className="mx-auto max-w-[700px] px-5 text-center">
          <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight font-bold tracking-tight text-fg">
            Your merge conflict shouldn't be a puzzle.
          </h2>
          <p className="mt-4 text-[16px] text-fg-muted">
            See both versions. Describe the result. Ship with confidence.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className={cn(
                'inline-flex h-12 items-center gap-2.5 rounded-xl px-6 text-[15px] font-semibold transition',
                'bg-brand-500 text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_12px_28px_-10px_rgba(91,131,240,0.7)]',
                'hover:bg-brand-400',
              )}
            >
              Start resolving conflicts
              <ArrowRightIcon className="h-4.5 w-4.5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink-600 bg-ink-800/60 px-6 text-[15px] font-medium text-fg transition hover:border-ink-500 hover:bg-ink-750"
            >
              Explore VisualMerge
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

/* Small user icon used inline in the AI section */
function UserIconSmall() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
