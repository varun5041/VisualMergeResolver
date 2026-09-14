import type { RepositoryBranch } from '../types/repository'
import { cn } from '../lib/utils'
import { GitBranchIcon } from './Icons'

const toneStyles = {
  a: 'border-branch-a/35 focus:border-branch-a',
  b: 'border-branch-b/35 focus:border-branch-b',
  base: 'border-ink-600 focus:border-brand-400',
} as const

/**
 * Picks one real branch out of a cloned repository. A native select keeps
 * long branch lists usable (type-ahead, keyboard) without extra machinery.
 */
export function BranchSelect({
  label,
  hint,
  tone,
  branches,
  value,
  onChange,
  disabledBranches = [],
}: {
  label: string
  hint?: string
  tone: 'a' | 'b' | 'base'
  branches: RepositoryBranch[]
  value: string
  onChange: (name: string) => void
  disabledBranches?: string[]
}) {
  const selected = branches.find((branch) => branch.name === value)

  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={`branch-${label}`}
          className="text-[12px] font-semibold tracking-wide text-fg-muted uppercase"
        >
          {label}
        </label>
        {hint ? <span className="text-[11.5px] text-fg-faint">{hint}</span> : null}
      </div>

      <div className="relative mt-2.5">
        <GitBranchIcon
          className={cn(
            'pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2',
            tone === 'a' && 'text-branch-a',
            tone === 'b' && 'text-branch-b',
            tone === 'base' && 'text-fg-muted',
          )}
        />
        <select
          id={`branch-${label}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'w-full appearance-none rounded-lg border bg-ink-950 py-2.5 pr-9 pl-9',
            'font-mono text-[13px] text-fg transition outline-none',
            'focus:ring-2 focus:ring-brand-400/20',
            toneStyles[tone],
          )}
        >
          {branches.map((branch) => (
            <option
              key={branch.name}
              value={branch.name}
              disabled={disabledBranches.includes(branch.name)}
            >
              {branch.name}
              {branch.isDefault ? '  (default)' : ''}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-fg-faint"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          aria-hidden="true"
        >
          <path d="m6.5 9.5 5.5 5.5 5.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {selected ? (
        <div className="mt-3 border-t border-ink-700 pt-2.5">
          <p className="truncate text-[12.5px] text-fg-muted">{selected.commitMessage}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-fg-faint">
            <span className="font-mono">{selected.shortCommitId}</span>
            <span>·</span>
            <span>{selected.author}</span>
            <span>·</span>
            <span>{selected.committedAt} UTC</span>
          </p>
        </div>
      ) : null}
    </div>
  )
}
