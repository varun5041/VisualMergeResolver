import type { MergePlan, MergePlanItem } from '../types'
import { cn } from '../lib/utils'
import { CheckIcon, CloseIcon, GitMergeIcon, LayersIcon, SparkIcon } from './Icons'
import { Chip, Panel, PanelHeader } from './ui'

function PlanRow({ item }: { item: MergePlanItem }) {
  const dropped = item.source === 'Dropped'
  const tone = item.source === 'Branch A' ? 'a' : item.source === 'Branch B' ? 'b' : 'neutral'

  return (
    <li
      className={cn(
        'flex items-center justify-between gap-4 rounded-lg border px-4 py-2.5 transition',
        dropped ? 'border-ink-700 bg-ink-900/40' : 'border-ink-700 bg-ink-900/60',
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {dropped ? (
          <CloseIcon className="h-3.5 w-3.5 shrink-0 text-fg-faint" strokeWidth={2.4} />
        ) : (
          <CheckIcon className="h-3.5 w-3.5 shrink-0 text-merged" strokeWidth={2.8} />
        )}
        <span
          className={cn(
            'truncate text-[13.5px]',
            dropped ? 'text-fg-faint line-through' : 'text-fg',
          )}
        >
          {item.feature}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="text-fg-faint">→</span>
        <Chip tone={tone === 'neutral' ? 'neutral' : tone}>{item.source}</Chip>
      </span>
    </li>
  )
}

export function MergePlanPanel({ plan }: { plan: MergePlan }) {
  const components = [...new Set(plan.items.map((item) => item.component))]
  const kept = plan.items.filter((item) => item.source !== 'Dropped').length

  return (
    <Panel>
      <PanelHeader
        icon={<GitMergeIcon className="h-4.5 w-4.5 text-merged" />}
        title="Merge Plan"
        subtitle={plan.summary}
        actions={
          <>
            <Chip tone="neutral">{plan.strategyLabel}</Chip>
            <Chip tone="merged">
              <CheckIcon className="h-3 w-3" strokeWidth={3} />
              {plan.conflictsResolved} conflicts resolved
            </Chip>
          </>
        }
      />

      <div className="space-y-5 p-5">
        <div className="flex items-start gap-3 rounded-lg border border-brand-400/25 bg-brand-400/8 p-4">
          <SparkIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
          <div>
            <p className="text-[12px] font-semibold tracking-wide text-brand-400 uppercase">
              Your instruction
            </p>
            <p className="mt-1 text-[13.5px] text-fg italic">“{plan.instruction}”</p>
          </div>
        </div>

        {components.map((component) => (
          <div key={component}>
            <div className="mb-2.5 flex items-center gap-2">
              <LayersIcon className="h-4 w-4 text-fg-faint" />
              <h3 className="text-[13.5px] font-semibold text-fg">{component}</h3>
            </div>
            <ul className="space-y-1.5">
              {plan.items
                .filter((item) => item.component === component)
                .map((item) => (
                  <PlanRow key={item.id} item={item} />
                ))}
            </ul>
          </div>
        ))}

        <div className="rounded-lg border border-ink-700 bg-ink-900/40 p-4">
          <p className="text-[12px] font-semibold tracking-wide text-fg-muted uppercase">Notes</p>
          <ul className="mt-2.5 space-y-1.5">
            {plan.notes.map((note) => (
              <li key={note} className="flex items-start gap-2.5 text-[13px] text-fg-muted">
                <span className="mt-1.75 h-1 w-1 shrink-0 rounded-full bg-fg-faint" />
                {note}
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-ink-700 pt-3 text-[12.5px] text-fg-faint">
            {kept} changes kept across {components.length} components.
          </p>
        </div>
      </div>
    </Panel>
  )
}
