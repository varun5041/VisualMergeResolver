import type { Conflict } from '../types'
import { cn } from '../lib/utils'
import { CheckIcon, GitMergeIcon, SparkIcon } from './Icons'
import { Chip, Panel, PanelHeader } from './ui'

function ChangeList({
  title,
  branch,
  items,
  tone,
}: {
  title: string
  branch: string
  items: string[]
  tone: 'a' | 'b'
}) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-fg">{title}</p>
        <span
          className={cn(
            'font-mono text-[11.5px]',
            tone === 'a' ? 'text-branch-a' : 'text-branch-b',
          )}
        >
          {branch}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[13px] text-fg-muted">
            <CheckIcon
              className={cn(
                'mt-0.5 h-3.5 w-3.5 shrink-0',
                tone === 'a' ? 'text-branch-a' : 'text-branch-b',
              )}
              strokeWidth={2.6}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AIAnalysisPanel({ conflict }: { conflict: Conflict }) {
  return (
    <Panel>
      <PanelHeader
        icon={<SparkIcon className="h-4.5 w-4.5 text-brand-400" />}
        title="AI Analysis"
        subtitle={`${conflict.title} · ${conflict.filePath}`}
        actions={<Chip tone="brand">{conflict.analysis.confidence}% confidence</Chip>}
      />

      <div className="space-y-4 p-5">
        <p className="text-[13.5px] leading-relaxed text-fg-muted">{conflict.analysis.summary}</p>

        <div className="grid gap-4 md:grid-cols-2">
          <ChangeList
            title="Branch A"
            branch="ganpati-theme"
            items={conflict.analysis.branchA}
            tone="a"
          />
          <ChangeList
            title="Branch B"
            branch="navbar-feature"
            items={conflict.analysis.branchB}
            tone="b"
          />
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-merged/25 bg-merged/8 p-4">
          <GitMergeIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-merged" />
          <div>
            <p className="text-[12px] font-semibold tracking-wide text-merged uppercase">
              Recommendation
            </p>
            <p className="mt-1 text-[13.5px] text-fg">{conflict.analysis.recommendation}</p>
          </div>
        </div>
      </div>
    </Panel>
  )
}
