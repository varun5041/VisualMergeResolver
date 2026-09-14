import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/** Measures an element and reports its current width in CSS pixels. */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setWidth(entry.contentRect.width)
    })
    observer.observe(node)
    setWidth(node.getBoundingClientRect().width)
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}

/**
 * Plays a list of steps one after another. Returns how many have finished and
 * whether the whole sequence is done — used by the analysing and verification
 * screens.
 */
export function useStepSequence(durations: number[], enabled = true) {
  const [completed, setCompleted] = useState(0)
  const key = durations.join(',')

  useEffect(() => {
    if (!enabled) {
      setCompleted(0)
      return
    }
    setCompleted(0)
    let index = 0
    let timer = 0
    const advance = () => {
      if (index >= durations.length) return
      timer = window.setTimeout(() => {
        index += 1
        setCompleted(index)
        advance()
      }, durations[index])
    }
    advance()
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  return { completed, done: completed >= durations.length }
}

/** Closes a floating menu when the user clicks anywhere outside of it. */
export function useDismissOnOutsideClick<T extends HTMLElement>(
  open: boolean,
  onDismiss: () => void,
) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (!open) return
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onDismiss()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onDismiss])

  return ref
}

/** Counts up towards a target — powers the live donation counter in Branch B. */
export function useTicker(start: number, stepRange: [number, number], intervalMs: number) {
  const [value, setValue] = useState(start)

  useEffect(() => {
    const [min, max] = stepRange
    const timer = window.setInterval(() => {
      setValue((current) => current + Math.floor(min + Math.random() * (max - min)))
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [stepRange, intervalMs])

  return value
}
