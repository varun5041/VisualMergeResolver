import { useRef } from 'react'
import { FULL_MOTION, gsap, useGSAP } from '../lib/motion'

/**
 * The one pinned moment on the page: two branches leaving a shared commit and
 * arriving back as a single verified result, drawn as you scroll.
 *
 * <p>This is the product in one picture, which is the only reason it earns a
 * pin. It also teaches the colour language the rest of the app relies on, so
 * nothing inside the app ever needs a legend: amber is Branch A, violet is
 * Branch B, green is a result that passed verification.
 *
 * <p>Under reduced motion the diagram renders complete and the section does not
 * pin at all, so the page stays an ordinary scroll.
 */

/** Commit positions, in the SVG's own coordinate space. */
const BASE_NODES = [
  { cx: 96, cy: 160 },
  { cx: 200, cy: 160 },
]
const BRANCH_A_NODES = [
  { cx: 368, cy: 72 },
  { cx: 452, cy: 72 },
  { cx: 536, cy: 72 },
]
const BRANCH_B_NODES = [
  { cx: 368, cy: 248 },
  { cx: 452, cy: 248 },
  { cx: 536, cy: 248 },
]
const MERGE_NODE = { cx: 688, cy: 160 }

const PATH_BASE = 'M 60 160 H 232'
const PATH_A = 'M 232 160 C 292 160, 300 72, 368 72 H 536 C 620 72, 628 160, 688 160'
const PATH_B = 'M 232 160 C 292 160, 300 248, 368 248 H 536 C 620 248, 628 160, 688 160'
const PATH_MERGED = 'M 688 160 H 800'

type Tone = 'base' | 'a' | 'b' | 'merged'

const STROKE: Record<Tone, string> = {
  base: 'var(--color-ink-500)',
  a: 'var(--color-branch-a)',
  b: 'var(--color-branch-b)',
  merged: 'var(--color-merged)',
}

/**
 * A commit.
 *
 * <p>Rendered in its finished state. Without JavaScript, or with animation
 * turned off, the whole diagram is simply there.
 */
function Node({ cx, cy, tone }: { cx: number; cy: number; tone: Tone }) {
  return (
    <circle
      data-node={tone}
      cx={cx}
      cy={cy}
      r={tone === 'merged' ? 13 : 9}
      fill="var(--color-ink-950)"
      stroke={STROKE[tone]}
      strokeWidth={tone === 'merged' ? 4 : 3}
      // fill-box makes the origin relative to the circle itself, so "center"
      // means its own centre rather than the corner of the whole canvas.
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    />
  )
}

export function MergeScene() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia(scope)

      media.add(FULL_MOTION, () => {
        const root = scope.current!
        const paths = gsap.utils.toArray<SVGPathElement>('[data-draw]', root)

        // Each path is hidden by offsetting its own dash by its full length, so
        // the reveal is a real stroke being drawn rather than a mask sliding
        // over it. stroke-dashoffset repaints the SVG but never reflows the
        // page, which is why it is the one exception to transform-and-opacity.
        paths.forEach((path) => {
          const length = path.getTotalLength()
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        })

        // The markup renders the finished diagram, so the starting state is set
        // here instead. Nothing is hidden unless the code that reveals it ran.
        gsap.set('[data-node]', { scale: 0, opacity: 0 })
        gsap.set('[data-label]', { opacity: 0 })
        gsap.set('[data-label="a"], [data-label="b"]', { x: -16 })
        gsap.set('[data-label="split"], [data-label="merged"]', { y: 12 })

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            // Pins the moment the section reaches the top, so the diagram is
            // never half off-screen while it draws.
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })

        timeline
          .to('[data-draw="base"]', { strokeDashoffset: 0, duration: 1 })
          .to('[data-node="base"]', { scale: 1, opacity: 1, duration: 0.4, stagger: 0.15 }, '<0.3')
          .to('[data-label="split"]', { opacity: 1, y: 0, duration: 0.5 }, '<')
          // A and B leave the same commit at the same moment, so they draw together.
          .to(['[data-draw="a"]', '[data-draw="b"]'], { strokeDashoffset: 0, duration: 2.4 }, '>')
          .to(
            '[data-node="a"]',
            { scale: 1, opacity: 1, duration: 0.35, stagger: 0.3, ease: 'back.out(2)' },
            '<0.35',
          )
          .to(
            '[data-node="b"]',
            { scale: 1, opacity: 1, duration: 0.35, stagger: 0.3, ease: 'back.out(2)' },
            '<',
          )
          .to('[data-label="a"]', { opacity: 1, x: 0, duration: 0.5 }, '<0.2')
          .to('[data-label="b"]', { opacity: 1, x: 0, duration: 0.5 }, '<')
          .to('[data-node="merged"]', { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' })
          .to('[data-draw="merged"]', { strokeDashoffset: 0, duration: 0.8 }, '<0.2')
          .to('[data-label="merged"]', { opacity: 1, y: 0, duration: 0.6 }, '<0.2')

        return () => timeline.kill()
      })

      // No branch for reduced motion: the markup is already the finished
      // diagram, and matchMedia only ever adds the hiding above when full
      // motion is welcome.
      return () => media.revert()
    },
    { scope },
  )

  return (
    <div ref={scope} className="relative flex min-h-[100dvh] items-center overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgba(91,131,240,0.10),transparent)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-5 py-16">
        <div className="max-w-[52ch]">
          <p className="font-mono text-[11px] font-medium tracking-[0.2em] text-brand-400 uppercase">
            One colour per branch
          </p>
          <h2 className="mt-5 text-[clamp(1.6rem,3.4vw,2.35rem)] leading-[1.15] font-bold tracking-tight text-fg">
            You will never have to ask which side you are looking at
          </h2>
        </div>

        {/* The diagram. Described for screen readers, which get the whole point
            in one sentence rather than a hundred unlabelled shapes. */}
        <figure className="relative mt-10 m-0">
          <svg
            viewBox="0 0 860 320"
            className="w-full"
            role="img"
            aria-label="Two branches leaving a shared commit and merging back into a single verified result."
          >
            <path
              data-draw="base"
              d={PATH_BASE}
              fill="none"
              stroke="var(--color-ink-500)"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <path
              data-draw="a"
              d={PATH_A}
              fill="none"
              stroke="var(--color-branch-a)"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <path
              data-draw="b"
              d={PATH_B}
              fill="none"
              stroke="var(--color-branch-b)"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <path
              data-draw="merged"
              d={PATH_MERGED}
              fill="none"
              stroke="var(--color-merged)"
              strokeWidth={4}
              strokeLinecap="round"
            />

            {BASE_NODES.map((node) => (
              <Node key={`base-${node.cx}`} {...node} tone="base" />
            ))}
            {BRANCH_A_NODES.map((node) => (
              <Node key={`a-${node.cx}`} {...node} tone="a" />
            ))}
            {BRANCH_B_NODES.map((node) => (
              <Node key={`b-${node.cx}`} {...node} tone="b" />
            ))}
            <Node {...MERGE_NODE} tone="merged" />
          </svg>

          {/* Labels sit in HTML rather than SVG text so they inherit the page's
              type scale and stay readable when the diagram scales down. */}
          <figcaption className="pointer-events-none absolute inset-0">
            <span
              data-label="a"
              className="absolute top-[8%] left-[42%] -translate-x-4 rounded-md border border-branch-a/35 bg-branch-a/10 px-2.5 py-1 font-mono text-[11.5px] whitespace-nowrap text-branch-a opacity-0 sm:text-[12.5px]"
            >
              Branch A
            </span>
            <span
              data-label="b"
              className="absolute bottom-[8%] left-[42%] -translate-x-4 rounded-md border border-branch-b/35 bg-branch-b/10 px-2.5 py-1 font-mono text-[11.5px] whitespace-nowrap text-branch-b opacity-0 sm:text-[12.5px]"
            >
              Branch B
            </span>
            <span
              data-label="split"
              className="absolute top-[56%] left-[4%] translate-y-3 font-mono text-[11px] whitespace-nowrap text-fg-faint opacity-0 sm:text-[12px]"
            >
              base
            </span>
            <span
              data-label="merged"
              className="absolute top-[56%] right-0 translate-y-3 rounded-md border border-merged/35 bg-merged/10 px-2.5 py-1 font-mono text-[11.5px] whitespace-nowrap text-merged opacity-0 sm:text-[12.5px]"
            >
              Merged
            </span>
          </figcaption>
        </figure>

        <p className="mt-10 max-w-[62ch] text-[14.5px] leading-relaxed text-fg-muted">
          Amber is always Branch A and violet is always Branch B, in the picker, the diff, the
          preview and the merge plan. Green means one thing only: a result that built, rendered and
          passed verification.
        </p>
      </div>
    </div>
  )
}
