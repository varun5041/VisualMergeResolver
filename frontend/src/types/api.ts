/** Shapes returned by the VisualMerge API. Nothing here is ever synthesised. */

export interface AuthenticatedUser {
  id: string
  githubId: string | null
  githubUsername: string | null
  name: string | null
  email: string | null
  avatarUrl: string | null
  githubConnected: boolean
  createdAt: string | null
}

export interface GitHubRepository {
  id: number
  name: string
  fullName: string
  owner: string
  isPrivate: boolean
  defaultBranch: string | null
  htmlUrl: string | null
  description: string | null
  language: string | null
  updatedAt: string | null
}

export interface GitHubBranch {
  name: string
  isProtected: boolean
  commitSha: string | null
}

/**
 * Only CREATED is reachable today. The rest belong to the comparison engine
 * that comes next, and are listed so the UI already knows every value the
 * backend can persist.
 */
export type MergeSessionStatus =
  | 'CREATED'
  | 'FETCHING'
  | 'COMPARING'
  | 'CONFLICTS_FOUND'
  | 'NO_CONFLICTS'
  | 'RESOLVING'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED'

export interface MergeSessionRepository {
  id: string
  githubRepositoryId: number
  owner: string
  name: string
  fullName: string
  isPrivate: boolean
  defaultBranch: string | null
  htmlUrl: string | null
}

export interface MergeSession {
  id: string
  repository: MergeSessionRepository
  baseBranch: string
  branchA: string
  branchB: string
  status: MergeSessionStatus
  conflictsCount: number | null
  createdAt: string | null
  updatedAt: string | null
}

export interface MergeSessionStats {
  totalSessions: number
  activeSessions: number
  completedMerges: number
  conflictsResolved: number
}

export interface CreateMergeSessionRequest {
  owner: string
  repository: string
  baseBranch: string
  branchA: string
  branchB: string
}
