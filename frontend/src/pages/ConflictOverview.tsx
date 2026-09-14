import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { BranchBadge } from '../components/BranchBadge'
import { CompatibleCard, ConflictCard } from '../components/ConflictCard'
import { AlertIcon, ArrowRightIcon, CheckIcon, GitMergeIcon } from '../components/Icons'
import { Button, Chip, Panel } from '../components/ui'
import { useFlow } from '../state/FlowContext'

export function ConflictOverview() {
  const navigate = useNavigate()
  const { comparison } = useFlow()

  useEffect(() => {
    if (!comparison) navigate('/', { replace: true })
  }, [comparison, navigate])

  if (!comparison) return null

  const stats = [
    { label: 'Files changed', value: String(comparison.filesChanged) },
    { label: 'Additions', value: `+${comparison.additions}` },
    { label: 'Deletions', value: `−${comparison.deletions}` },
    { label: 'Components in conflict', value: String(comparison.conflictCount) },
  ]

  return (
    <AppShell step="conflicts">
      <div className="mx-auto max-w-[1060px]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-danger/30 bg-danger/10 text-danger">
                <AlertIcon className="h-4 w-4" />
              </span>
              <h1 className="text-[26px] leading-none font-semibold tracking-tight text-fg">
                {comparison.conflictCount} conflicts detected
              </h1>
            </div>
            <p className="mt-3 text-[14px] text-fg-muted">
              Both branches changed the same components. VisualMerge will show you each version
              running side by side.
            </p>
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <BranchBadge name={comparison.branchA} label="Branch A" tone="a" size="sm" />
              <span className="text-[12px] text-fg-faint">vs</span>
              <BranchBadge name={comparison.branchB} label="Branch B" tone="b" size="sm" />
              <span className="text-[12px] text-fg-faint">into</span>
              <BranchBadge name={comparison.baseBranch} tone="base" size="sm" />
            </div>
          </div>

          <Button variant="primary" size="lg" onClick={() => navigate('/resolve')}>
            <GitMergeIcon className="h-4.5 w-4.5" />
            Resolve Conflicts
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <Panel key={stat.label} className="px-4 py-3.5">
              <p className="font-mono text-[17px] font-semibold text-fg">{stat.value}</p>
              <p className="mt-1 text-[12.5px] text-fg-faint">{stat.label}</p>
            </Panel>
          ))}
        </div>

        <section className="mt-8">
          <div className="mb-3.5 flex items-center gap-2.5">
            <h2 className="text-[15px] font-semibold text-fg">Needs a decision</h2>
            <Chip tone="danger">{comparison.conflicts.length}</Chip>
          </div>
          <div className="space-y-3.5">
            {comparison.conflicts.map((conflict, index) => (
              <ConflictCard
                key={conflict.id}
                conflict={conflict}
                index={index}
                onOpen={() => navigate(`/resolve?conflict=${conflict.id}`)}
              />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3.5 flex items-center gap-2.5">
            <h2 className="text-[15px] font-semibold text-fg">Applies cleanly</h2>
            <Chip tone="merged">
              <CheckIcon className="h-3 w-3" strokeWidth={3} />
              {comparison.compatible.length}
            </Chip>
          </div>
          <div className="space-y-3.5">
            {comparison.compatible.map((change) => (
              <CompatibleCard key={change.id} change={change} />
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink-700 bg-ink-850/60 px-5 py-4">
          <p className="text-[13.5px] text-fg-muted">
            Ready to decide? You will see both versions running before anything is merged.
          </p>
          <Button variant="primary" onClick={() => navigate('/resolve')}>
            Resolve Conflicts
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
