import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, toApiError } from '../services/http'

export type AsyncStatus = 'loading' | 'success' | 'error'

export interface AsyncResult<T> {
  data: T | null
  error: ApiError | null
  status: AsyncStatus
  isLoading: boolean
  /** Runs the loader again, keeping whatever is on screen until it resolves. */
  reload: () => void
}

/**
 * Loads data once and re-runs when a dependency changes.
 *
 * <p>Every screen in VisualMerge shows real data or an honest failure, so the
 * error is kept rather than swallowed, and an in-flight request is cancelled
 * when the component goes away or the inputs change.
 */
export function useAsync<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
  options: { enabled?: boolean } = {},
): AsyncResult<T> {
  const enabled = options.enabled ?? true

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [status, setStatus] = useState<AsyncStatus>(enabled ? 'loading' : 'success')
  const [attempt, setAttempt] = useState(0)

  // Kept in a ref so changing the loader identity between renders does not
  // retrigger the effect — the dependency list is the contract.
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  useEffect(() => {
    if (!enabled) {
      setStatus('success')
      return
    }
    const controller = new AbortController()
    let active = true

    setStatus('loading')
    setError(null)

    loaderRef
      .current(controller.signal)
      .then((result) => {
        if (!active) return
        setData(result)
        setStatus('success')
      })
      .catch((failure) => {
        if (!active || controller.signal.aborted) return
        setError(toApiError(failure))
        setStatus('error')
      })

    return () => {
      active = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  return { data, error, status, isLoading: status === 'loading', reload }
}
