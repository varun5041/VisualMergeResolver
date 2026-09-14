/** Types for the real-repository flow. Kept separate from the demo types. */

export interface RepositoryBranch {
  name: string
  fullRef: string
  commitId: string
  shortCommitId: string
  commitMessage: string
  author: string
  committedAt: string
  isDefault: boolean
}

export interface GitRepository {
  id: string
  owner: string
  name: string
  fullName: string
  webUrl: string
  defaultBranch: string
  branchCount: number
  sizeKb: number
  connectedAt: string
  state: string
  branches: RepositoryBranch[]
}

export interface ValidateRepositoryResponse {
  valid: boolean
  owner: string
  name: string
  fullName: string
  webUrl: string
  branchCount: number
}

/** Stable error codes returned by the backend for repository operations. */
export type RepositoryErrorCode =
  | 'INVALID_URL'
  | 'REPOSITORY_NOT_FOUND'
  | 'REPOSITORY_INACCESSIBLE'
  | 'CLONE_FAILED'
  | 'CLONE_TIMEOUT'
  | 'REPOSITORY_TOO_LARGE'
  | 'NO_BRANCHES'
  | 'UNKNOWN_REPOSITORY'
  | 'WORKSPACE_ERROR'
  | 'NETWORK'

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode
  readonly status: number

  constructor(code: RepositoryErrorCode, message: string, status = 0) {
    super(message)
    this.name = 'RepositoryError'
    this.code = code
    this.status = status
  }
}

/** The three branches chosen for a merge analysis. */
export interface BranchSelection {
  base: string
  branchA: string
  branchB: string
}
