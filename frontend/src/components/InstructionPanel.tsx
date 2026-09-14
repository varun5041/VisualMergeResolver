import type { Conflict, Strategy } from '../types'
import { cn } from '../lib/utils'
import { ArrowRightIcon, GitBranchIcon, SparkIcon } from './Icons'
import { Button, Panel, PanelHeader } from './ui'

const options: Array<{
  id: Strategy
  title: string
  branch: string
  description: string
  tone: 'a' | 'b' | 'merged'
}> = [
  {
    id: 'BRANCH_A',
    title: 'Use Branch A',
    branch: 'ganpati-theme',
    description: 'Take this component exactly as Branch A wrote it.',
    tone: 'a',
  },
  {
    id: 'BRANCH_B',
    title: 'Use Branch B',
    branch: 'navbar-feature',
    description: 'Take this component exactly as Branch B wrote it.',
    tone: 'b',
  },
  {
    id: 'COMBINE',
    title: 'Combine with AI',
    branch: 'recommended',
    description: 'Describe the result you want and let VisualMerge compose it.',
    tone: 'merged',
  },
]

const toneRing = {
  a: 'border-branch-a bg-branch-a/10',
  b: 'border-branch-b bg-branch-b/10',
  merged: 'border-merged bg-merged/10',
}

const toneText = {
  a: 'text-branch-a',
  b: 'text-branch-b',
  merged: 'text-merged',
}

export function InstructionPanel({
  conflict,
  strategy,
  instruction,
  onStrategyChange,
  onInstructionChange,
  onGenerate,
  generating = false,
}: {
  conflict: Conflict
  strategy: Strategy
  instruction: string
  onStrategyChange: (strategy: Strategy) => void
  onInstructionChange: (instruction: string) => void
  onGenerate: () => void
  generating?: boolean
}) {
  const combining = strategy === 'COMBINE'

  return (
    <Panel>
      <PanelHeader
        icon={<GitBranchIcon className="h-4.5 w-4.5 text-fg-muted" />}
        title="What should the final version look like?"
        subtitle={`Applies to ${conflict.title.toLowerCase()} · you can set this per conflict`}
      />

      <div className="space-y-5 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {options.map((option) => {
            const selected = strategy === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onStrategyChange(option.id)}
                className={cn(
                  'rounded-lg border p-4 text-left transition',
                  selected
                    ? toneRing[option.tone]
                    : 'border-ink-700 bg-ink-900/50 hover:border-ink-600 hover:bg-ink-800',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'text-[13.5px] font-semibold',
                      selected ? toneText[option.tone] : 'text-fg',
                    )}
                  >
                    {option.title}
                  </span>
                  <span
                    className={cn(
                      'grid h-4 w-4 place-items-center rounded-full border',
                      selected ? 'border-current ' + toneText[option.tone] : 'border-ink-500',
                    )}
                  >
                    {selected ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    ) : null}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11.5px] text-fg-faint">{option.branch}</p>
                <p className="mt-2 text-[12.5px] leading-snug text-fg-muted">{option.description}</p>
                {option.id === 'COMBINE' ? (
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-brand-400">
                    <SparkIcon className="h-3.5 w-3.5" />
                    Recommended
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        <div>
          <label
            htmlFor={`instruction-${conflict.id}`}
            className="mb-2 flex items-center justify-between text-[12.5px] text-fg-muted"
          >
            <span>Instruction to VisualMerge</span>
            {!combining ? (
              <span className="text-fg-faint">
                Only used when combining — pick “Combine with AI” to edit
              </span>
            ) : null}
          </label>
          <textarea
            id={`instruction-${conflict.id}`}
            value={instruction}
            disabled={!combining}
            onChange={(event) => onInstructionChange(event.target.value)}
            rows={3}
            placeholder="Tell VisualMerge what the final version should look like..."
            className={cn(
              'w-full resize-none rounded-lg border bg-ink-900 px-4 py-3 text-[13.5px] leading-relaxed text-fg',
              'placeholder:text-fg-faint focus:outline-none',
              combining
                ? 'border-ink-600 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25'
                : 'border-ink-700 opacity-50',
            )}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12.5px] text-fg-faint">
            VisualMerge will compose a merge plan for all conflicts in this comparison.
          </p>
          <Button variant="primary" size="lg" onClick={onGenerate} disabled={generating}>
            <SparkIcon className="h-4 w-4" />
            {generating ? 'Generating…' : 'Generate Merge'}
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Panel>
  )
}
