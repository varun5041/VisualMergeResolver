import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AiThinking } from '../components/AiThinking'
import { AppShell } from '../components/AppShell'
import { BranchBadge } from '../components/BranchBadge'
import { BrowserPreview } from '../components/BrowserPreview'
import type { PreviewDevice } from '../components/BrowserPreview'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  DesktopIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  MobileIcon,
} from '../components/Icons'
import { MergePlanPanel } from '../components/MergePlanPanel'
import { MergeRequestModal } from '../components/MergeRequestModal'
import { SitePage } from '../components/preview/SitePage'
import { VerificationPanel } from '../components/VerificationPanel'
import { Button, Chip, Panel } from '../components/ui'
import { cn } from '../lib/utils'
import { api } from '../services/api'
import { useFlow } from '../state/FlowContext'
import type { MergePlan, MergeResult } from '../types'

type Stage = 'generating' | 'plan' | 'applying' | 'result' | 'success'

const planThinking = [
  'Reading Branch A component tree…',
  'Reading Branch B component tree…',
  'Matching your instruction to changed regions…',
  'Resolving overlapping styles…',
  'Composing the merged components…',
]

const applyThinking = [
  'Writing merged components…',
  'Installing dependencies…',
  'Starting the merged build…',
]

function DeviceToggle({
  device,
  onChange,
}: {
  device: PreviewDevice
  onChange: (device: PreviewDevice) => void
}) {
  return (
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
          onClick={() => onChange(option.id)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] transition',
            device === option.id ? 'bg-ink-700 font-medium text-fg' : 'text-fg-muted hover:text-fg',
          )}
        >
          <option.Icon className="h-3.5 w-3.5" />
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function MergeResultPage() {
  const navigate = useNavigate()
  const { comparison, resolutions, plan, result, setPlan, setResult } = useFlow()
  const [stage, setStage] = useState<Stage>(plan ? 'plan' : 'generating')
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [verified, setVerified] = useState(false)
  const [prOpen, setPrOpen] = useState(false)
  const requested = useRef(false)

  useEffect(() => {
    if (!comparison) navigate('/', { replace: true })
  }, [comparison, navigate])

  // Generate the plan once, while the thinking animation plays.
  useEffect(() => {
    if (!comparison || plan || requested.current) return
    requested.current = true
    const list = Object.values(resolutions)
    const primary = resolutions['conflict-navbar'] ?? list[0]
    const started = Date.now()

    api
      .planMerge({
        comparisonId: comparison.id,
        resolutions: list,
        strategy: primary?.strategy ?? 'COMBINE',
        instruction: primary?.instruction ?? '',
      })
      .then((generated: MergePlan) => {
        const elapsed = Date.now() - started
        window.setTimeout(
          () => {
            setPlan(generated)
            setStage('plan')
          },
          Math.max(0, 3300 - elapsed),
        )
      })
  }, [comparison, plan, resolutions, setPlan])

  const applyMerge = () => {
    if (!plan) return
    setStage('applying')
    const started = Date.now()
    api.applyMerge(plan).then((applied: MergeResult) => {
      const elapsed = Date.now() - started
      window.setTimeout(
        () => {
          setResult(applied)
          setStage('result')
        },
        Math.max(0, 1900 - elapsed),
      )
    })
  }

  if (!comparison) return null

  if (stage === 'generating' || !plan) {
    return (
      <AppShell step="merge">
        <div className="flex min-h-[62vh] items-center justify-center">
          <AiThinking
            title="Generating merge"
            caption="VisualMerge is composing a merged version from your instruction."
            lines={planThinking}
          />
        </div>
      </AppShell>
    )
  }

  if (stage === 'applying') {
    return (
      <AppShell step="merge">
        <div className="flex min-h-[62vh] items-center justify-center">
          <AiThinking
            title="Applying merge"
            caption="Building the merged version so you can look at it."
            lines={applyThinking}
          />
        </div>
      </AppShell>
    )
  }

  if (stage === 'plan') {
    return (
      <AppShell step="merge">
        <div className="mx-auto max-w-[900px]">
          <button
            type="button"
            onClick={() => navigate('/resolve')}
            className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] text-fg-faint transition hover:text-fg-muted"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to visual resolver
          </button>

          <div className="animate-fade-up">
            <MergePlanPanel plan={plan} />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink-700 bg-ink-850/60 px-5 py-4">
            <p className="text-[13.5px] text-fg-muted">
              Applying builds the merged version — nothing is pushed anywhere.
            </p>
            <Button variant="primary" size="lg" onClick={applyMerge}>
              <GitMergeIcon className="h-4.5 w-4.5" />
              Apply Merge
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!result) return null

  const merged = (
    <BrowserPreview
      label="Merged Result"
      branch={`${comparison.branchA} + ${comparison.branchB}`}
      tone="merged"
      url="preview.causekind.org/visualmerge/merge-candidate"
      device={device}
      onDeviceChange={setDevice}
      height={device === 'mobile' ? 620 : 560}
      virtualHeight={device === 'mobile' ? 1800 : 1500}
      footer={
        <div className="flex flex-wrap items-center gap-1.5">
          {plan.items
            .filter((item) => item.source !== 'Dropped')
            .slice(0, 6)
            .map((item) => (
              <Chip key={item.id} tone={item.source === 'Branch A' ? 'a' : 'b'}>
                {item.feature}
              </Chip>
            ))}
        </div>
      }
    >
      <SitePage
        navbar={result.preview.navbar}
        hero={result.preview.hero}
        compact={device === 'mobile'}
      />
    </BrowserPreview>
  )

  if (stage === 'success') {
    const mergeRequest = result.mergeRequest
    return (
      <AppShell step="verify">
        <div className="mx-auto max-w-[900px]">
          <Panel className="animate-fade-up overflow-hidden">
            <div className="relative border-b border-ink-700 bg-[radial-gradient(ellipse_70%_120%_at_50%_0%,rgba(52,211,153,0.18),transparent)] px-8 py-10 text-center">
              <div className="text-[40px] leading-none animate-pop">🎉</div>
              <h1 className="mt-4 text-[26px] leading-none font-semibold tracking-tight text-fg">
                Merge Candidate Ready
              </h1>
              <p className="mt-3 text-[15px] text-fg-muted">{comparison.projectId === 'causekind' ? 'CauseKind' : comparison.projectId}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <BranchBadge name={mergeRequest.sourceBranch} tone="a" size="sm" />
                <ArrowRightIcon className="h-3.5 w-3.5 text-fg-faint" />
                <BranchBadge name={mergeRequest.targetBranch} tone="base" size="sm" />
              </div>
            </div>

            <div className="grid gap-2.5 p-6 sm:grid-cols-3">
              {[
                'Conflicts resolved',
                'Visual verification passed',
                'Merge candidate generated',
              ].map((line) => (
                <div
                  key={line}
                  className="flex items-center gap-2.5 rounded-lg border border-merged/25 bg-merged/8 px-4 py-3"
                >
                  <CheckIcon className="h-4 w-4 shrink-0 text-merged" strokeWidth={3} />
                  <span className="text-[13px] text-fg">{line}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-700 bg-ink-900/40 px-6 py-4">
              <p className="text-[13px] text-fg-faint">
                Prototype — the merge request below is mock data.
              </p>
              <div className="flex items-center gap-2.5">
                <Button onClick={() => navigate('/')}>Back to dashboard</Button>
                <Button variant="primary" size="lg" onClick={() => setPrOpen(true)}>
                  <GitPullRequestIcon className="h-4.5 w-4.5" />
                  View Merge Request
                </Button>
              </div>
            </div>
          </Panel>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-fg">What you are merging</h2>
              <DeviceToggle device={device} onChange={setDevice} />
            </div>
            {merged}
          </div>
        </div>

        <MergeRequestModal
          mergeRequest={mergeRequest}
          open={prOpen}
          onClose={() => setPrOpen(false)}
        />
      </AppShell>
    )
  }

  return (
    <AppShell step="verify" contentClassName="max-w-[1560px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => setStage('plan')}
            className="mb-2.5 inline-flex items-center gap-1.5 text-[12.5px] text-fg-faint transition hover:text-fg-muted"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to merge plan
          </button>
          <h1 className="text-[24px] leading-none font-semibold tracking-tight text-fg">
            Merged Result
          </h1>
          <p className="mt-2.5 text-[14px] text-fg-muted">
            This is the merged build running. Open the menus and switch viewports before you accept
            it.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <DeviceToggle device={device} onChange={setDevice} />
          <Chip tone="merged">
            <CheckIcon className="h-3 w-3" strokeWidth={3} />
            {plan.conflictsResolved} conflicts resolved
          </Chip>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div>{merged}</div>

        <div className="space-y-5">
          <VerificationPanel
            verification={result.verification}
            onComplete={() => setVerified(true)}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink-700 bg-ink-850/60 px-5 py-4">
            <p className="text-[13px] text-fg-muted">
              {verified
                ? 'Everything checks out. Ready when you are.'
                : 'Waiting for the visual checks to finish…'}
            </p>
            <Button
              variant="primary"
              size="lg"
              disabled={!verified}
              onClick={() => setStage('success')}
            >
              <GitPullRequestIcon className="h-4.5 w-4.5" />
              Create Merge Request
            </Button>
          </div>

          <MergePlanPanel plan={plan} />
        </div>
      </div>
    </AppShell>
  )
}
