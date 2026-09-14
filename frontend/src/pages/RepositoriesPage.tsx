import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRightIcon,
  ClockIcon,
  ExternalLinkIcon,
  FolderIcon,
  GitBranchIcon,
  LockIcon,
  SearchIcon,
} from '../components/Icons'
import { EmptyState, ErrorState, LoadingRows } from '../components/states'
import { Button, Chip, Panel } from '../components/ui'
import { useAsync } from '../lib/useAsync'
import { cn, formatRelativeTime } from '../lib/utils'
import { githubApi } from '../services/visualMergeApi'
import type { GitHubRepository } from '../types/api'

type Visibility = 'all' | 'public' | 'private'

const VISIBILITY_OPTIONS: Array<{ id: Visibility; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
]

function RepositoryRow({
  repository,
  onStartMerge,
}: {
  repository: GitHubRepository
  onStartMerge: () => void
}) {
  const updated = formatRelativeTime(repository.updatedAt)
  return (
    <Panel className="transition hover:border-ink-600">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-ink-700 bg-ink-900 text-fg-muted">
            <FolderIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[14px] font-semibold text-fg">
                {repository.fullName}
              </span>
              {repository.isPrivate ? (
                <Chip tone="warn">
                  <LockIcon className="h-3 w-3" />
                  Private
                </Chip>
              ) : (
                <Chip tone="neutral">Public</Chip>
              )}
            </div>
            {repository.description && (
              <p className="mt-1 line-clamp-2 max-w-[560px] text-[13px] text-fg-muted">
                {repository.description}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] text-fg-faint">
              <span>
                Owner: <span className="text-fg-muted">{repository.owner}</span>
              </span>
              {repository.defaultBranch && (
                <span className="flex items-center gap-1.5">
                  <GitBranchIcon className="h-3 w-3" />
                  <span className="font-mono text-fg-muted">{repository.defaultBranch}</span>
                </span>
              )}
              {repository.language && <span>{repository.language}</span>}
              {updated && (
                <span className="flex items-center gap-1.5">
                  <ClockIcon className="h-3 w-3" />
                  {updated}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {repository.htmlUrl && (
            <a
              href={repository.htmlUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 text-[12.5px] text-fg-muted transition hover:text-fg"
            >
              <ExternalLinkIcon className="h-3.5 w-3.5" />
              GitHub
            </a>
          )}
          <Button size="sm" onClick={onStartMerge}>
            New merge
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Panel>
  )
}

export function RepositoriesPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('all')

  const { data, error, status, isLoading, reload } = useAsync(
    (signal) => githubApi.repositories(signal),
    [],
  )

  const filtered = useMemo(() => {
    if (!data) return []
    const needle = query.trim().toLowerCase()
    return data.filter((repository) => {
      if (visibility === 'public' && repository.isPrivate) return false
      if (visibility === 'private' && !repository.isPrivate) return false
      if (!needle) return true
      return (
        repository.fullName.toLowerCase().includes(needle) ||
        (repository.description?.toLowerCase().includes(needle) ?? false) ||
        (repository.language?.toLowerCase().includes(needle) ?? false)
      )
    })
  }, [data, query, visibility])

  const hasRepositories = (data?.length ?? 0) > 0

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-fg">Repositories</h1>
          <p className="mt-1 text-[14px] text-fg-muted">
            Every repository your GitHub account can reach, live from GitHub.
          </p>
        </div>
        {hasRepositories && (
          <p className="font-mono text-[12.5px] text-fg-faint">
            {filtered.length} of {data!.length}
          </p>
        )}
      </div>

      {hasRepositories && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fg-faint" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search repositories"
              spellCheck={false}
              className={cn(
                'h-10 w-full rounded-lg border border-ink-600 bg-ink-950 pr-4 pl-9',
                'text-[13.5px] text-fg placeholder:text-fg-faint',
                'transition outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
              )}
            />
          </div>
          <div
            role="group"
            aria-label="Filter by visibility"
            className="flex items-center gap-1 rounded-lg border border-ink-700 bg-ink-900/60 p-1"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={visibility === option.id}
                onClick={() => setVisibility(option.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-[12.5px] font-medium transition',
                  visibility === option.id
                    ? 'bg-brand-500/15 text-brand-400'
                    : 'text-fg-muted hover:text-fg',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        {isLoading && <LoadingRows rows={4} height="h-[108px]" />}

        {status === 'error' && error && <ErrorState error={error} onRetry={reload} />}

        {status === 'success' && !hasRepositories && (
          <EmptyState
            icon={FolderIcon}
            title="No repositories on this GitHub account"
            description="VisualMerge can only work with repositories your GitHub account can reach. Create one on GitHub, or get added to an existing one, and it will appear here."
            action={
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-9.5 items-center gap-2 rounded-lg border border-ink-600 bg-ink-800 px-4 text-sm font-medium text-fg transition hover:border-ink-500"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                Create one on GitHub
              </a>
            }
          />
        )}

        {status === 'success' && hasRepositories && filtered.length === 0 && (
          <EmptyState
            icon={SearchIcon}
            title="Nothing matches that filter"
            description="No repository matches your search and visibility filter. Try a different term."
            action={
              <Button
                onClick={() => {
                  setQuery('')
                  setVisibility('all')
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}

        {status === 'success' && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((repository) => (
              <RepositoryRow
                key={repository.id}
                repository={repository}
                onStartMerge={() =>
                  navigate(
                    `/merge/new?owner=${encodeURIComponent(repository.owner)}&repo=${encodeURIComponent(repository.name)}`,
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
