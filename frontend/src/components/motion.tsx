import { useRef } from 'react'
import type { ElementType, ReactNode } from 'react'
import { EASE, FULL_MOTION, createMagnet, createTilt, gsap, useGSAP } from '../lib/motion'
import { cn } from '../lib/utils'

/**
 * Reveals a block's direct children as it enters the viewport.
 *
 * <p>The stagger is what carries the hierarchy: a heading lands before the copy
 * under it, so the eye is told what to read first. Capped at eight children,
 * beyond which the last items feel laggy.
 */
export function Reveal({
  children,
  className,
  id,
  as: Tag = 'section',
  stagger = 0.07,
  y = 24,
  start = 'top 85%',
}: {
  children: ReactNode
  className?: string
  id?: string
  as?: ElementType
  stagger?: number
  y?: number
  start?: string
}) {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia()

      media.add(FULL_MOTION, () => {
        gsap.from(scope.current!.children, {
          opacity: 0,
          y,
          duration: 0.6,
          ease: EASE,
          stagger,
          scrollTrigger: {
            // Scoped to this container so ScrollTrigger does not rescan the page.
            trigger: scope.current,
            start,
            toggleActions: 'play none none reverse',
          },
        })
      })

      return () => media.revert()
    },
    { scope },
  )

  return (
    <Tag ref={scope} id={id} className={className}>
      {children}
    </Tag>
  )
}

/**
 * A surface that tilts in 3D toward the pointer.
 *
 * <p>Skipped entirely for coarse pointers, where there is no hover to track,
 * and under reduced motion.
 */
export function Tilt({
  children,
  className,
  maxTiltDeg,
}: {
  children: ReactNode
  className?: string
  maxTiltDeg?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add(`${FULL_MOTION} and (pointer: fine)`, () =>
        createTilt(ref.current!, { maxTiltDeg }),
      )
      return () => media.revert()
    },
    { scope: ref, dependencies: [maxTiltDeg] },
  )

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  )
}

/** A call to action that leans toward the pointer. Fine pointers only. */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add(`${FULL_MOTION} and (pointer: fine)`, () => createMagnet(ref.current!))
      return () => media.revert()
    },
    { scope: ref },
  )

  return (
    <span ref={ref} className={cn('inline-block will-change-transform', className)}>
      {children}
    </span>
  )
}
