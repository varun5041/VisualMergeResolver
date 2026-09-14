import { request } from './http'
import type {
  AuthenticatedUser,
  CreateMergeSessionRequest,
  GitHubBranch,
  GitHubRepository,
  MergeSession,
  MergeSessionStats,
} from '../types/api'

/** The GitHub authorization URL. The backend owns the whole OAuth exchange. */
export const GITHUB_LOGIN_URL = `${import.meta.env.VITE_API_ORIGIN ?? 'http://localhost:8080'}/oauth2/authorization/github`

export const authApi = {
  /** The signed-in VisualMerge account, or a 401 if there is no session. */
  me: (signal?: AbortSignal) => request<AuthenticatedUser>('/auth/me', { signal }),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),
}

export const githubApi = {
  /** Repositories the signed-in GitHub account can actually see. */
  repositories: (signal?: AbortSignal) =>
    request<GitHubRepository[]>('/github/repositories', { signal, timeoutMs: 30_000 }),

  repository: (owner: string, repo: string, signal?: AbortSignal) =>
    request<GitHubRepository>(`/github/repositories/${encode(owner)}/${encode(repo)}`, { signal }),

  branches: (owner: string, repo: string, signal?: AbortSignal) =>
    request<GitHubBranch[]>(
      `/github/repositories/${encode(owner)}/${encode(repo)}/branches`,
      { signal, timeoutMs: 30_000 },
    ),
}

export const mergeSessionApi = {
  list: (signal?: AbortSignal) => request<MergeSession[]>('/merge-sessions', { signal }),

  stats: (signal?: AbortSignal) => request<MergeSessionStats>('/merge-sessions/stats', { signal }),

  get: (id: string, signal?: AbortSignal) =>
    request<MergeSession>(`/merge-sessions/${encodeURIComponent(id)}`, { signal }),

  /** Creates a session after the backend has verified the repo and branches. */
  create: (payload: CreateMergeSessionRequest) =>
    request<MergeSession>('/merge-sessions', {
      method: 'POST',
      body: payload,
      timeoutMs: 45_000,
    }),
}

function encode(segment: string): string {
  return encodeURIComponent(segment)
}
