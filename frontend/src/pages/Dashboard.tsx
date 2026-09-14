import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell, VisualMergeMark } from '../components/AppShell'
import { BranchBadge } from '../components/BranchBadge'
import {
  ArrowRightIcon,
  ClockIcon,
  GitBranchIcon,
  GitMergeIcon,
  ShieldCheckIcon,
  SparkIcon,
} from '../components/Icons'
import { Button, Chip, Mono, Panel, PanelHeader } from '../components/ui'
import { api } from '../services/api'
import { useFlow } from '../state/FlowContext'
import { demoProject } from '../data/mockData'

function BranchCard({
  branch,
  tone,
}: {
  branch: typeof demoProject.branchA
  tone: 'a' | 'b'
}) {
  return (
    <div
      className={
        'rounded-xl border bg-ink-900/60 p-5 transition ' +
        (tone === 'a'
          ? 'border-branch-a/25 hover:border-branch-a/45'
          : 'border-branch-b/25 hover:border-branch-b/45')
      }
    >
      <div className="flex items-center justify-between gap-3">
        <BranchBadge name={branch.name} label={branch.label} tone={tone} />
        <span className="text-[12px] text-fg-faint">{branch.updatedAt}</span>
      </div>
      <p className="mt-4 text-[13.5px] text-fg">{branch.lastCommit}</p>
      <div className="mt-4 flex items-center gap-4 border-t border-ink-700 pt-3.5 text-[12.5px] text-fg-faint">
        <span className="flex items-center gap-1.5">
          <GitBranchIcon className="h-3.5 w-3.5" />
          {branch.commits} commits ahead
        </span>
        <span className="flex items-center gap-1.5">
          <ClockIcon className="h-3.5 w-3.5" />
          {branch.author}
        </span>
      </div>
    </div>
  )
}

const principles = [
  {
    icon: GitBranchIcon,
    title: 'See both versions running',
    body: 'Each branch is rendered as a real, interactive page — not a diff of the code behind it.',
  },
  {
    icon: SparkIcon,
    title: 'Describe the result you want',
    body: '“Keep the navbar from A but the profile menu from B.” VisualMerge composes it for you.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Verify before you merge',
    body: 'The merged build is rendered and checked so you approve what you can actually see.',
  },
]

export function Dashboard() {
  const navigate = useNavigate()
  const { project, setProject, reset } = useFlow()
  const active = project ?? demoProject

  useEffect(() => {
    let cancelled = false
    api.getProjects().then((projects) => {
      if (!cancelled && projects[0]) setProject(projects[0])
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startComparison = () => {
    reset()
    navigate('/analyzing')
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-[1100px]">
        <div className="flex flex-col items-center text-center">
          <VisualMergeMark size={46} />
          <h1 className="mt-4 text-[34px] leading-none font-semibold tracking-tight text-fg">
            VisualMerge
          </h1>
          <p className="mt-3 text-[15px] text-fg-muted">
            Resolve conflicts by seeing the result, not reading the diff.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Chip tone="brand">
              <SparkIcon className="h-3.5 w-3.5" />
              AI-assisted visual merges
            </Chip>
            <Chip tone="neutral">Prototype · mock repository data</Chip>
          </div>
        </div>

        <Panel className="mt-9 animate-fade-up">
          <PanelHeader
            icon={<GitMergeIcon className="h-4.5 w-4.5 text-brand-400" />}
            title={
              <span className="flex items-center gap-2.5">
                {active.name}
                <Chip tone="neutral">{active.language}</Chip>
              </span>
            }
            subtitle={
              <span className="flex flex-wrap items-center gap-2">
                <Mono className="text-fg-muted">{active.repository}</Mono>
                <span className="text-fg-faint">·</span>
                <span>{active.description}</span>
              </span>
            }
            actions={<Chip tone="neutral">{active.updatedAt}</Chip>}
          />

          <div className="p-5">
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3">
              <span className="text-[12px] font-semibold tracking-wide text-fg-muted uppercase">
                Base
              </span>
              <BranchBadge name={active.baseBranch} tone="base" size="sm" />
              <span className="text-[13px] text-fg-faint">
                Both branches will be merged back into this branch.
              </span>
            </div>

            <div className="mt-4 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
              <BranchCard branch={active.branchA} tone="a" />
              <div className="flex items-center justify-center">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-ink-600 bg-ink-900 font-mono text-[12px] text-fg-muted">
                  vs
                </span>
              </div>
              <BranchCard branch={active.branchB} tone="b" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Files changed', value: '14' },
                { label: 'Lines added / removed', value: '+486 / −132' },
                { label: 'Potential UI conflicts', value: '2' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3"
                >
                  <p className="font-mono text-[17px] font-semibold text-fg">{stat.value}</p>
                  <p className="mt-1 text-[12.5px] text-fg-faint">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink-700 pt-5">
              <p className="text-[13px] text-fg-faint">
                VisualMerge will build both branches and compare them visually.
              </p>
              <Button variant="primary" size="lg" onClick={startComparison}>
                <GitMergeIcon className="h-4.5 w-4.5" />
                Compare Branches
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Panel>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="rounded-xl border border-ink-800 bg-ink-850/40 p-5"
            >
              <principle.icon className="h-4.5 w-4.5 text-brand-400" />
              <h3 className="mt-3 text-[14px] font-semibold text-fg">{principle.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{principle.body}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  )
}
