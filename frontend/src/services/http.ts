/**
 * The single HTTP client for the VisualMerge API.
 *
 * <p>It never falls back to bundled data. If the backend is down, GitHub is
 * unreachable, or the session has expired, the caller gets an {@link ApiError}
 * and the UI says so — a screen in this app only ever shows something that
 * actually exists.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const DEFAULT_TIMEOUT_MS = 20_000

/** Stable codes the backend sends, plus the two the browser can produce. */
export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'GITHUB_AUTHORIZATION_REQUIRED'
  | 'GITHUB_UNREACHABLE'
  | 'GITHUB_RATE_LIMITED'
  | 'GITHUB_NOT_FOUND'
  | 'GITHUB_ERROR'
  | 'REPOSITORY_NOT_FOUND'
  | 'REPOSITORY_FORBIDDEN'
  | 'BRANCH_NOT_FOUND'
  | 'INVALID_BRANCH_SELECTION'
  | 'INVALID_REQUEST'
  | 'MERGE_SESSION_NOT_FOUND'
  | 'MERGE_SESSION_FORBIDDEN'
  | 'DATABASE_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'NETWORK'
  | 'TIMEOUT'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number

  constructor(code: ApiErrorCode, message: string, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }

  /** True when the only fix is signing in again. */
  get requiresSignIn(): boolean {
    return this.status === 401
  }
}

async function readError(response: Response): Promise<ApiError> {
  let code: ApiErrorCode = 'INTERNAL_ERROR'
  let message = `The request failed (${response.status}).`
  try {
    const body = await response.json()
    if (typeof body?.code === 'string') code = body.code as ApiErrorCode
    if (typeof body?.message === 'string') message = body.message
  } catch {
    // A non-JSON body means something in front of the API answered; the
    // generic message is the honest thing to show.
  }
  if (response.status === 401 && code === 'INTERNAL_ERROR') {
    code = 'UNAUTHENTICATED'
    message = 'Sign in with GitHub to continue.'
  }
  return new ApiError(code, message, response.status)
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  timeoutMs?: number
  signal?: AbortSignal
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, timeoutMs = DEFAULT_TIMEOUT_MS, signal } = options

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  // A caller-supplied signal (component unmount) has to cancel too.
  signal?.addEventListener('abort', () => controller.abort(), { once: true })

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      // The session cookie is the whole authentication story, so it must ride
      // along on every call.
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (failure) {
    if (signal?.aborted) throw failure
    if (failure instanceof DOMException && failure.name === 'AbortError') {
      throw new ApiError('TIMEOUT', 'The request took too long and was stopped.')
    }
    throw new ApiError(
      'NETWORK',
      'Could not reach the VisualMerge backend. Make sure it is running on port 8080.',
    )
  } finally {
    window.clearTimeout(timer)
  }

  if (!response.ok) throw await readError(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Turns anything thrown by a fetch into an ApiError with a usable message. */
export function toApiError(failure: unknown): ApiError {
  if (failure instanceof ApiError) return failure
  return new ApiError('INTERNAL_ERROR', 'Something went wrong. Please try again.')
}
