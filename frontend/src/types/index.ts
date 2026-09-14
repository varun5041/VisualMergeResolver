export type BranchKey = 'A' | 'B'
export type Strategy = 'BRANCH_A' | 'BRANCH_B' | 'COMBINE'
export type Variant = 'BRANCH_A' | 'BRANCH_B' | 'MERGED'
export type ComponentKey = 'navbar' | 'hero' | 'footer'

export interface Branch {
  name: string
  label: string
  author: string
  commits: number
  lastCommit: string
  updatedAt: string
  accent: string
}

export interface Project {
  id: string
  name: string
  repository: string
  description: string
  language: string
  baseBranch: string
  branchA: Branch
  branchB: Branch
  updatedAt: string
}

export interface AiAnalysis {
  summary: string
  branchA: string[]
  branchB: string[]
  recommendation: string
  compatibility: string
  confidence: number
}

export interface CodeDiff {
  filePath: string
  language: string
  branchA: string
  branchB: string
  conflictMarkers: string
}

export interface Conflict {
  id: string
  title: string
  component: ComponentKey
  type: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  status: string
  description: string
  filePath: string
  branchAChanges: string[]
  branchBChanges: string[]
  analysis: AiAnalysis
  codeDiff: CodeDiff
  defaultInstruction: string
}

export interface CompatibleChange {
  id: string
  title: string
  component: ComponentKey
  status: string
  description: string
  filePath: string
}

export interface Comparison {
  id: string
  projectId: string
  baseBranch: string
  branchA: string
  branchB: string
  createdAt: string
  conflictCount: number
  conflicts: Conflict[]
  compatible: CompatibleChange[]
  analysisSteps: string[]
  filesChanged: number
  additions: number
  deletions: number
}

export interface PreviewComposition {
  navbar: Variant
  hero: Variant
  footer: Variant
}

export interface MergePlanItem {
  id: string
  component: string
  feature: string
  source: 'Branch A' | 'Branch B' | 'Dropped'
  sourceBranch: string
  note: string
}

export interface MergePlan {
  id: string
  comparisonId: string
  projectId: string
  strategy: Strategy
  strategyLabel: string
  instruction: string
  conflictIds: string[]
  conflictsResolved: number
  summary: string
  items: MergePlanItem[]
  notes: string[]
  preview: PreviewComposition
  createdAt: string
}

export interface VerificationStep {
  id: string
  label: string
  durationMs: number
}

export interface VerificationCheck {
  id: string
  label: string
  status: string
}

export interface Verification {
  steps: VerificationStep[]
  checks: VerificationCheck[]
  verdict: string
}

export interface Commit {
  hash: string
  message: string
  author: string
  time: string
}

export interface ChangedFile {
  path: string
  status: string
  additions: number
  deletions: number
}

export interface MergeRequest {
  id: string
  number: number
  title: string
  description: string
  sourceBranch: string
  targetBranch: string
  url: string
  state: string
  filesChanged: number
  additions: number
  deletions: number
  commits: Commit[]
  files: ChangedFile[]
}

export interface MergeResult {
  id: string
  planId: string
  projectId: string
  status: string
  plan: MergePlan
  preview: PreviewComposition
  verification: Verification
  mergeRequest: MergeRequest
  createdAt: string
}

/** How the user chose to settle one conflict. */
export interface Resolution {
  conflictId: string
  strategy: Strategy
  instruction: string
}

export interface MergePlanRequest {
  comparisonId: string
  resolutions: Resolution[]
  strategy: Strategy
  instruction: string
}
