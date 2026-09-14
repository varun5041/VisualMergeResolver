import { Chip } from './ui'
import type { MergeSessionStatus } from '../types/api'

type Tone = 'neutral' | 'brand' | 'warn' | 'danger' | 'merged'

/** Every status the backend can persist, so nothing ever renders as raw enum text. */
const PRESENTATION: Record<MergeSessionStatus, { tone: Tone; label: string }> = {
  CREATED: { tone: 'neutral', label: 'Created' },
  FETCHING: { tone: 'brand', label: 'Fetching' },
  COMPARING: { tone: 'brand', label: 'Comparing' },
  CONFLICTS_FOUND: { tone: 'warn', label: 'Conflicts found' },
  NO_CONFLICTS: { tone: 'merged', label: 'No conflicts' },
  RESOLVING: { tone: 'warn', label: 'Resolving' },
  VERIFYING: { tone: 'brand', label: 'Verifying' },
  COMPLETED: { tone: 'merged', label: 'Completed' },
  FAILED: { tone: 'danger', label: 'Failed' },
}

export function MergeSessionStatusChip({ status }: { status: MergeSessionStatus }) {
  const presentation = PRESENTATION[status] ?? { tone: 'neutral' as Tone, label: status }
  return <Chip tone={presentation.tone}>{presentation.label}</Chip>
}
