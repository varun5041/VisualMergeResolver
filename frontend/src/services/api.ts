import {
  buildComparison,
  buildMergePlan,
  buildMergeResult,
  demoConflicts,
  demoProject,
} from '../data/mockData'
import type { Comparison, Conflict, MergePlan, MergePlanRequest, MergeResult, Project } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
const TIMEOUT_MS = 4000

export type ApiMode = 'live' | 'mock'

let mode: ApiMode = 'live'
const listeners = new Set<(mode: ApiMode) => void>()

export function getApiMode(): ApiMode {
  return mode
}

export function onApiModeChange(listener: (mode: ApiMode) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function setMode(next: ApiMode) {
  if (mode === next) return
  mode = next
  listeners.forEach((listener) => listener(next))
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }
    setMode('live')
    return (await response.json()) as T
  } finally {
    window.clearTimeout(timer)
  }
}

/**
 * Calls the Spring Boot mock API and silently falls back to the bundled demo
 * data when the backend is unreachable, so the product flow always completes.
 */
async function withFallback<T>(path: string, init: RequestInit | undefined, fallback: () => T): Promise<T> {
  try {
    return await request<T>(path, init)
  } catch (error) {
    console.warn(`[VisualMerge] ${path} unavailable, using bundled mock data.`, error)
    setMode('mock')
    return fallback()
  }
}

export const api = {
  getProjects: () => withFallback<Project[]>('/projects', undefined, () => [demoProject]),

  getProject: (id: string) => withFallback<Project>(`/projects/${id}`, undefined, () => demoProject),

  getConflicts: (projectId: string) =>
    withFallback<Conflict[]>(`/projects/${projectId}/conflicts`, undefined, () => demoConflicts),

  compare: (projectId: string, baseBranch: string, branchA: string, branchB: string) =>
    withFallback<Comparison>(
      '/compare',
      { method: 'POST', body: JSON.stringify({ projectId, baseBranch, branchA, branchB }) },
      buildComparison,
    ),

  planMerge: (payload: MergePlanRequest) =>
    withFallback<MergePlan>('/merge/plan', { method: 'POST', body: JSON.stringify(payload) }, () =>
      buildMergePlan(payload),
    ),

  applyMerge: (plan: MergePlan) =>
    withFallback<MergeResult>(
      '/merge/apply',
      { method: 'POST', body: JSON.stringify({ planId: plan.id }) },
      () => buildMergeResult(plan),
    ),

  getMerge: (id: string, plan: MergePlan) =>
    withFallback<MergeResult>(`/merge/${id}`, undefined, () => buildMergeResult(plan)),
}
