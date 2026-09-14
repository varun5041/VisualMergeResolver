import type {
  GitRepository,
  RepositoryBranch,
  RepositoryErrorCode,
  ValidateRepositoryResponse,
} from '../types/repository'
import { RepositoryError } from '../types/repository'

/**
 * Client for the real-repository API.
 *
 * Unlike the demo client in `api.ts`, this NEVER falls back to mock data. A
 * failure here is surfaced to the user exactly as the backend reported it —
 * the real flow must never show a fabricated success.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

/** Cloning a repository can legitimately take a while. */
const CONNECT_TIMEOUT_MS = 180_000
const DEFAULT_TIMEOUT_MS = 20_000

async function request<T>(
  path: string,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new RepositoryError(
        'CLONE_TIMEOUT',
        'The request took too long and was stopped. The repository may be very large.',
      )
    }
    throw new RepositoryError(
      'NETWORK',
      'Could not reach the VisualMerge backend. Make sure it is running on port 8080.',
    )
  } finally {
    window.clearTimeout(timer)
  }

  if (!response.ok) {
    let code: RepositoryErrorCode = 'CLONE_FAILED'
    let message = `Request failed (${response.status}).`
    try {
      const body = await response.json()
      if (body?.code) code = body.code as RepositoryErrorCode
      if (body?.message) message = body.message
    } catch {
      // Keep the generic message if the body is not JSON.
    }
    throw new RepositoryError(code, message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

export const repositoryApi = {
  /** Checks the URL and that the repository is readable, without cloning. */
  validate: (url: string) =>
    request<ValidateRepositoryResponse>('/repositories/validate', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  /** Clones into an isolated workspace and discovers the real branches. */
  connect: (url: string) =>
    request<GitRepository>(
      '/repositories',
      { method: 'POST', body: JSON.stringify({ url }) },
      CONNECT_TIMEOUT_MS,
    ),

  get: (id: string) => request<GitRepository>(`/repositories/${id}`),

  branches: (id: string) => request<RepositoryBranch[]>(`/repositories/${id}/branches`),

  refresh: (id: string) =>
    request<GitRepository>(`/repositories/${id}/refresh`, { method: 'POST' }),

  /** Disconnects and deletes the temporary workspace on the backend. */
  disconnect: (id: string) =>
    request<void>(`/repositories/${id}`, { method: 'DELETE' }),
}
