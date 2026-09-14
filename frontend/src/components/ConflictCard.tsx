import type { CompatibleChange, Conflict } from '../types'
import { cn } from '../lib/utils'
import { ArrowRightIcon, CheckIcon, FileIcon, LayersIcon } from './Icons'
import { Chip, Mono } from './ui'
import { StatusBadge } from './StatusBadge'

export function ConflictCard({
  conflict,
  index,
  resolved = false,
  onOpen,
}: {
  conflict: Conflict
  index: number
  resolved?: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group w-full rounded-xl border border-ink-700 bg-ink-850/80 p-5 text-left transition',
        'hover:-translate-y-0.5 hover:border-ink-600 hover:bg-ink-800 hover:shadow-[0_20px_40px_-28px_rgba(0,0,0,0.9)]',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg border border-ink-600 bg-ink-900 font-mono text-[13px] text-fg-muted">
            {index + 1}
          </span>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-[15px] font-semibold text-fg">{conflict.title}</h3>
              {resolved ? (
                <StatusBadge status="resolved" />
              ) : (
                <StatusBadge status="conflict">{conflict.type}</StatusBadge>
              )}
            </div>
            <p className="mt-1.5 text-[13.5px] text-fg-muted">{conflict.description}</p>
            <p className="mt-2 flex items-center gap-1.5 text-fg-faint">
              <FileIcon className="h-3.5 w-3.5" />
              <Mono>{conflict.filePath}</Mono>
            </p>
          </div>
        </div>
        <ArrowRightIcon className="mt-1 h-4.5 w-4.5 shrink-0 text-fg-faint transition group-hover:translate-x-0.5 group-hover:text-fg" />
      </div>

      <div className="mt-4 grid gap-3 border-t border-ink-700 pt-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-[11.5px] text-branch-a">ganpati-theme</p>
          <div className="flex flex-wrap gap-1.5">
            {conflict.branchAChanges.map((change) => (
              <Chip key={change} tone="a">
                {change}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono text-[11.5px] text-branch-b">navbar-feature</p>
          <div className="flex flex-wrap gap-1.5">
            {conflict.branchBChanges.map((change) => (
              <Chip key={change} tone="b">
                {change}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}

export function CompatibleCard({ change }: { change: CompatibleChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-ink-700 bg-ink-850/50 p-5">
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg border border-merged/30 bg-merged/10 text-merged">
          <CheckIcon className="h-4 w-4" strokeWidth={2.8} />
        </span>
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-[15px] font-semibold text-fg">{change.title}</h3>
            <StatusBadge status="compatible" />
          </div>
          <p className="mt-1.5 text-[13.5px] text-fg-muted">{change.description}</p>
          <p className="mt-2 flex items-center gap-1.5 text-fg-faint">
            <FileIcon className="h-3.5 w-3.5" />
            <Mono>{change.filePath}</Mono>
          </p>
        </div>
      </div>
      <LayersIcon className="mt-1 h-4.5 w-4.5 shrink-0 text-fg-faint" />
    </div>
  )
}
