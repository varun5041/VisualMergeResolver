import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

/**
 * Motion primitives for the marketing page.
 *
 * <p>Three rules hold everywhere in here:
 *
 * <ul>
 *   <li>Only <code>transform</code> and <code>opacity</code> are animated, so
 *       every tween stays on the compositor.
 *   <li>Continuous pointer and scroll values never touch React state. They go
 *       through {@code gsap.quickTo} setters, which write straight to the
 *       element instead of re-rendering the tree on every frame.
 *   <li>Everything is wrapped in {@code gsap.matchMedia}, so a visitor who asks
 *       for reduced motion gets the finished layout immediately rather than a
 *       slower version of the same movement.
 * </ul>
 */

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Matches anyone who has not asked for less motion. */
export const FULL_MOTION = '(prefers-reduced-motion: no-preference)'

/** The page's shared easing. One curve everywhere keeps the rhythm consistent. */
export const EASE = 'power3.out'

export { gsap, ScrollTrigger, useGSAP }

/**
 * Web fonts and images change element heights after ScrollTrigger has already
 * measured them, which leaves pinned sections starting at the wrong scroll
 * position. Recalculating once everything has settled fixes it.
 */
export function refreshTriggersWhenReady(): void {
  const refresh = () => ScrollTrigger.refresh()
  if (document.fonts?.status === 'loaded') {
    refresh()
  } else {
    void document.fonts?.ready.then(refresh)
  }
  window.addEventListener('load', refresh, { once: true })
}

/**
 * Tilts an element in 3D toward the pointer and lifts it slightly.
 *
 * <p>Real perspective, not a shadow trick, and no WebGL: the browser composites
 * `rotateX`/`rotateY` on the GPU. Returns handlers to spread onto the element.
 */
export function createTilt(
  element: HTMLElement,
  options: { maxTiltDeg?: number; lift?: number; scale?: number } = {},
) {
  const { maxTiltDeg = 7, lift = -6, scale = 1.012 } = options

  // quickTo keeps one tween alive per property and retargets it, which is far
  // cheaper than creating a tween on every pointermove.
  const rotateX = gsap.quickTo(element, 'rotationX', { duration: 0.5, ease: EASE })
  const rotateY = gsap.quickTo(element, 'rotationY', { duration: 0.5, ease: EASE })
  const moveY = gsap.quickTo(element, 'y', { duration: 0.5, ease: EASE })
  const scaleTo = gsap.quickTo(element, 'scale', { duration: 0.5, ease: EASE })

  gsap.set(element, { transformPerspective: 900, transformOrigin: 'center' })

  const onPointerMove = (event: PointerEvent) => {
    const bounds = element.getBoundingClientRect()
    // -0.5 to 0.5, measured from the middle of the element.
    const px = (event.clientX - bounds.left) / bounds.width - 0.5
    const py = (event.clientY - bounds.top) / bounds.height - 0.5
    rotateY(px * maxTiltDeg * 2)
    rotateX(-py * maxTiltDeg * 2)
  }

  const onPointerEnter = () => {
    moveY(lift)
    scaleTo(scale)
  }

  const onPointerLeave = () => {
    rotateX(0)
    rotateY(0)
    moveY(0)
    scaleTo(1)
  }

  element.addEventListener('pointermove', onPointerMove)
  element.addEventListener('pointerenter', onPointerEnter)
  element.addEventListener('pointerleave', onPointerLeave)

  return () => {
    element.removeEventListener('pointermove', onPointerMove)
    element.removeEventListener('pointerenter', onPointerEnter)
    element.removeEventListener('pointerleave', onPointerLeave)
    gsap.set(element, { clearProps: 'transform' })
  }
}

/**
 * Pulls an element a little way toward the pointer while the pointer is near
 * it, and springs it back on the way out.
 *
 * <p>Used on the primary calls to action only. The element's own hit area never
 * moves far enough to make it harder to click.
 */
export function createMagnet(element: HTMLElement, strength = 0.28) {
  const moveX = gsap.quickTo(element, 'x', { duration: 0.45, ease: EASE })
  const moveY = gsap.quickTo(element, 'y', { duration: 0.45, ease: EASE })

  const onPointerMove = (event: PointerEvent) => {
    const bounds = element.getBoundingClientRect()
    moveX((event.clientX - (bounds.left + bounds.width / 2)) * strength)
    moveY((event.clientY - (bounds.top + bounds.height / 2)) * strength)
  }

  const onPointerLeave = () => {
    // A spring on the way back reads as elastic without overshooting enough to
    // look like a bug.
    gsap.to(element, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' })
  }

  element.addEventListener('pointermove', onPointerMove)
  element.addEventListener('pointerleave', onPointerLeave)

  return () => {
    element.removeEventListener('pointermove', onPointerMove)
    element.removeEventListener('pointerleave', onPointerLeave)
    gsap.set(element, { clearProps: 'transform' })
  }
}
