import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AIAnalysisPanel } from '../components/AIAnalysisPanel'
import { AppShell } from '../components/AppShell'
import { BrowserPreview } from '../components/BrowserPreview'
import type { PreviewDevice } from '../components/BrowserPreview'
import { CodeDiffModal } from '../components/CodeDiffModal'
import {
  ArrowLeftIcon,
  CodeIcon,
  DesktopIcon,
  MobileIcon,
} from '../components/Icons'
import { InstructionPanel } from '../components/InstructionPanel'
import { SitePage } from '../components/preview/SitePage'
import { StatusBadge } from '../components/StatusBadge'
import { Button, Chip } from '../components/ui'
import { cn } from '../lib/utils'
import { useFlow } from '../state/FlowContext'
import type { Strategy } from '../types'

export function ConflictResolver() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { comparison, resolutions, setResolution } = useFlow()
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [diffOpen, setDiffOpen] = useState(false)

  useEffect(() => {
    if (!comparison) navigate('/', { replace: true })
  }, [comparison, navigate])

  const conflicts = useMemo(() => comparison?.conflicts ?? [], [comparison])
  const requested = searchParams.get('conflict')
  const activeId = conflicts.some((conflict) => conflict.id === requested)
    ? (requested as string)
    : conflicts[0]?.id

  const conflict = conflicts.find((item) => item.id === activeId)

  if (!comparison || !conflict) return null

  const resolution = resolutions[conflict.id] ?? {
    conflictId: conflict.id,
    strategy: 'COMBINE' as Strategy,
    instruction: conflict.defaultInstruction,
  }

  const changeTab = (id: string) => setSearchParams({ conflict: id }, { replace: true })

  const previewHeight = device === 'mobile' ? 560 : 440
  const virtualHeight = device === 'mobile' ? 1800 : 1500

  return (
    <AppShell step="resolve" contentClassName="max-w-[1560px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/conflicts')}
            className="mb-2.5 inline-flex items-center gap-1.5 text-[12.5px] text-fg-faint transition hover:text-fg-muted"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to conflicts
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] leading-none font-semibold tracking-tight text-fg">
              {conflict.title} Conflict
            </h1>
            <StatusBadge status="conflict">{conflict.type}</StatusBadge>
          </div>
          <p className="mt-2.5 text-[14px] text-fg-muted">{conflict.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-0.5 rounded-lg border border-ink-700 bg-ink-900 p-0.5">
            {(
              [
                { id: 'desktop', label: 'Desktop', Icon: DesktopIcon },
                { id: 'mobile', label: 'Mobile', Icon: MobileIcon },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setDevice(option.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] transition',
                  device === option.id
                    ? 'bg-ink-700 font-medium text-fg'
                    : 'text-fg-muted hover:text-fg',
                )}
              >
                <option.Icon className="h-3.5 w-3.5" />
                {option.label}
              </button>
            ))}
          </div>
          <Button onClick={() => setDiffOpen(true)}>
            <CodeIcon className="h-4 w-4" />
            View Code Diff
          </Button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {conflicts.map((item) => {
          const selected = item.id === conflict.id
          const itemResolution = resolutions[item.id]
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => changeTab(item.id)}
              className={cn(
                'inline-flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-[13px] transition',
                selected
                  ? 'border-brand-400/40 bg-brand-500/12 font-medium text-fg'
                  : 'border-ink-700 bg-ink-850/60 text-fg-muted hover:border-ink-600 hover:text-fg',
              )}
            >
              {item.title}
              {itemResolution ? (
                <Chip
                  tone={
                    itemResolution.strategy === 'BRANCH_A'
                      ? 'a'
                      : itemResolution.strategy === 'BRANCH_B'
                        ? 'b'
                        : 'merged'
                  }
                >
                  {itemResolution.strategy === 'BRANCH_A'
                    ? 'Branch A'
                    : itemResolution.strategy === 'BRANCH_B'
                      ? 'Branch B'
                      : 'Combine'}
                </Chip>
              ) : null}
            </button>
          )
        })}
        <span className="ml-1 text-[12.5px] text-fg-faint">
          Set a decision for each conflicting component.
        </span>
      </div>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <BrowserPreview
          label="Branch A"
          branch={comparison.branchA}
          tone="a"
          url={`preview.causekind.org/${comparison.branchA}`}
          device={device}
          onDeviceChange={setDevice}
          height={previewHeight}
          virtualHeight={virtualHeight}
          footer={
            <div className="flex flex-wrap items-center gap-1.5">
              {conflict.branchAChanges.map((change) => (
                <Chip key={change} tone="a">
                  {change}
                </Chip>
              ))}
            </div>
          }
        >
          <SitePage
            navbar="BRANCH_A"
            hero="BRANCH_A"
            compact={device === 'mobile'}
            highlight={conflict.component}
          />
        </BrowserPreview>

        <BrowserPreview
          label="Branch B"
          branch={comparison.branchB}
          tone="b"
          url={`preview.causekind.org/${comparison.branchB}`}
          device={device}
          onDeviceChange={setDevice}
          height={previewHeight}
          virtualHeight={virtualHeight}
          footer={
            <div className="flex flex-wrap items-center gap-1.5">
              {conflict.branchBChanges.map((change) => (
                <Chip key={change} tone="b">
                  {change}
                </Chip>
              ))}
            </div>
          }
        >
          <SitePage
            navbar="BRANCH_B"
            hero="BRANCH_B"
            compact={device === 'mobile'}
            highlight={conflict.component}
          />
        </BrowserPreview>
      </section>

      <p className="mt-3 text-center text-[12.5px] text-fg-faint">
        These are live builds — open the menus, switch to mobile, scroll the page.
      </p>

      <div className="mt-7 grid gap-5 xl:grid-cols-2">
        <AIAnalysisPanel conflict={conflict} />
        <InstructionPanel
          conflict={conflict}
          strategy={resolution.strategy}
          instruction={resolution.instruction}
          onStrategyChange={(strategy) => setResolution(conflict.id, { strategy })}
          onInstructionChange={(instruction) => setResolution(conflict.id, { instruction })}
          onGenerate={() => navigate('/merge')}
        />
      </div>

      <CodeDiffModal conflict={conflict} open={diffOpen} onClose={() => setDiffOpen(false)} />
    </AppShell>
  )
}
