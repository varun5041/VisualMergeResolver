import { useNavigate } from 'react-router-dom'
import {
  ArrowRightIcon,
  ClockIcon,
  ExternalLinkIcon,
  FolderIcon,
  GitBranchIcon,
  PlusIcon,
} from '../components/Icons'
import { Button, Chip, Panel } from '../components/ui'

/* ── Empty state ── */
function EmptyRepos({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-700 bg-ink-900/30 px-6 py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-xl border border-ink-700 bg-ink-850/60 text-fg-muted">
        <FolderIcon className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-[17px] font-semibold text-fg">Connect your first repository</h3>
      <p className="mt-2 max-w-[360px] text-[13.5px] text-fg-muted">
        VisualMerge works with your real GitHub repositories. Connect one to get started.
      </p>
      <Button variant="primary" size="lg" className="mt-6" onClick={onConnect}>
        <GitBranchIcon className="h-4.5 w-4.5" />
        Connect GitHub
      </Button>
    </div>
  )
}

/* ── Placeholder repo list (will be populated from real data) ── */
const connectedRepos = [
  {
    id: 'demo-1',
    name: 'causekind-web',
    owner: 'causekind',
    fullName: 'causekind/causekind-web',
    branches: 5,
    defaultBranch: 'main',
    lastConnected: '2 hours ago',
    webUrl: 'https://github.com/causekind/causekind-web',
    isDemo: true,
  },
]

export function RepositoriesPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-fg">Repositories</h1>
          <p className="mt-1 text-[14px] text-fg-muted">Manage your connected GitHub repositories.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/connect')}>
          <PlusIcon className="h-4 w-4" />
          Connect Repository
        </Button>
      </div>

      {connectedRepos.length > 0 ? (
        <div className="mt-6 space-y-3">
          {connectedRepos.map((repo) => (
            <Panel
              key={repo.id}
              className="transition hover:border-ink-600"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-ink-700 bg-ink-900 text-fg-muted">
                    <FolderIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[14px] font-semibold text-fg">{repo.fullName}</span>
                      {repo.isDemo && <Chip tone="warn">Demo</Chip>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-fg-faint">
                      <span className="flex items-center gap-1.5">
                        <GitBranchIcon className="h-3 w-3" />
                        {repo.branches} branches
                      </span>
                      <span>Default: <span className="font-mono text-fg-muted">{repo.defaultBranch}</span></span>
                      <span className="flex items-center gap-1.5">
                        <ClockIcon className="h-3 w-3" />
                        {repo.lastConnected}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={repo.webUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 text-[12.5px] text-fg-muted transition hover:text-fg"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                  <Button size="sm" onClick={() => navigate('/merge/new')}>
                    New merge
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyRepos onConnect={() => navigate('/connect')} />
        </div>
      )}
    </div>
  )
}
