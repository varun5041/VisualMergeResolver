import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Comparison, MergePlan, MergeResult, Project, Resolution, Strategy } from '../types'

interface FlowState {
  project: Project | null
  comparison: Comparison | null
  resolutions: Record<string, Resolution>
  plan: MergePlan | null
  result: MergeResult | null
}

interface FlowContextValue extends FlowState {
  setProject: (project: Project) => void
  setComparison: (comparison: Comparison) => void
  setResolution: (conflictId: string, patch: { strategy?: Strategy; instruction?: string }) => void
  setPlan: (plan: MergePlan | null) => void
  setResult: (result: MergeResult | null) => void
  reset: () => void
}

const STORAGE_KEY = 'visualmerge.flow'

const emptyState: FlowState = {
  project: null,
  comparison: null,
  resolutions: {},
  plan: null,
  result: null,
}

function readStoredState(): FlowState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState
    return { ...emptyState, ...(JSON.parse(raw) as Partial<FlowState>) }
  } catch {
    return emptyState
  }
}

function persist(state: FlowState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage is a convenience only — losing it just means starting over.
  }
}

const FlowContext = createContext<FlowContextValue | null>(null)

export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FlowState>(readStoredState)

  const update = useCallback((patch: Partial<FlowState> | ((prev: FlowState) => Partial<FlowState>)) => {
    setState((prev) => {
      const resolved = typeof patch === 'function' ? patch(prev) : patch
      const next = { ...prev, ...resolved }
      persist(next)
      return next
    })
  }, [])

  const value = useMemo<FlowContextValue>(
    () => ({
      ...state,
      setProject: (project) => update({ project }),
      setComparison: (comparison) =>
        update({
          comparison,
          // A fresh comparison starts every conflict on the AI recommendation.
          resolutions: Object.fromEntries(
            comparison.conflicts.map((conflict) => [
              conflict.id,
              {
                conflictId: conflict.id,
                strategy: 'COMBINE' as Strategy,
                instruction: conflict.defaultInstruction,
              },
            ]),
          ),
          plan: null,
          result: null,
        }),
      setResolution: (conflictId, patch) =>
        update((prev) => ({
          resolutions: {
            ...prev.resolutions,
            [conflictId]: {
              conflictId,
              strategy: patch.strategy ?? prev.resolutions[conflictId]?.strategy ?? 'COMBINE',
              instruction: patch.instruction ?? prev.resolutions[conflictId]?.instruction ?? '',
            },
          },
        })),
      setPlan: (plan) => update({ plan }),
      setResult: (result) => update({ result }),
      reset: () => {
        persist(emptyState)
        setState(emptyState)
      },
    }),
    [state, update],
  )

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>
}

export function useFlow(): FlowContextValue {
  const context = useContext(FlowContext)
  if (!context) throw new Error('useFlow must be used inside <FlowProvider>')
  return context
}
