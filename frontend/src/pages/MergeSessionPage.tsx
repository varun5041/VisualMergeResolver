import { useNavigate, useParams } from 'react-router-dom'
import { BranchBadge } from '../components/BranchBadge'
import {
  ArrowLeftIcon,
  ClockIcon,
  ExternalLinkIcon,
  GitMergeIcon,
  LockIcon,
} from '../components/Icons'
import { MergeSessionStatusChip } from '../components/MergeSessionStatusChip'
import { ErrorState, Skeleton } from '../components/states'
import { Button, Chip, Panel, PanelHeader } from '../components/ui'
import { useAsync } from '../lib/useAsync'
import { formatDateTime, formatRelativeTime } from '../lib/utils'
import { mergeSessionApi } from '../services/visualMergeApi'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3">
      <p className="text-[12px] text-fg-faint">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

export function MergeSessionPage() {
  const navigate = useNavigate()
  const { sessionId = '' } = useParams<{ sessionId: string }>()

  const { data, error, status, reload } = useAsync(
    (signal) => mergeSessionApi.get(sessionId, signal),
    [sessionId],
  )

  return (
    <div className="mx-auto max-w-[860px] px-5 py-8">
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] text-fg-faint transition hover:text-fg-muted"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to dashboard
      </button>

      {status === 'loading' && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-[320px]" />
          <Skeleton className="h-[220px] w-full" />
        </div>
      )}

      {status === 'error' && error && (
        <ErrorState
          error={error}
          onRetry={error.status === 403 || error.status === 404 ? undefined : reload}
          action={
            error.status === 403 || error.status === 404 ? (
              <Button size="sm" onClick={() => navigate('/dashboard')}>
                Go to dashboard
              </Button>
            ) : undefined
          }
        />
      )}

      {status === 'success' && data && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-mono text-[20px] font-bold tracking-tight text-fg">
                  {data.repository.fullName}
                </h1>
                {data.repository.isPrivate && (
                  <Chip tone="warn">
                    <LockIcon className="h-3 w-3" />
                    Private
                  </Chip>
                )}
              </div>
              <p className="mt-1 font-mono text-[12px] text-fg-faint">Session {data.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <MergeSessionStatusChip status={data.status} />
              {data.repository.htmlUrl && (
                <a
                  href={data.repository.htmlUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 text-[12.5px] text-fg-muted transition hover:text-fg"
                >
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
            </div>
          </div>

          <Panel className="mt-6">
            <PanelHeader
              icon={<GitMergeIcon className="h-4.5 w-4.5 text-brand-400" />}
              title="Branches under comparison"
              subtitle="Saved when the session was created and verified against GitHub at that moment."
            />
            <div className="grid gap-3 p-5 sm:grid-cols-3">
              <Field label="Base branch">
                <BranchBadge name={data.baseBranch} tone="base" />
              </Field>
              <Field label="Branch A">
                <BranchBadge name={data.branchA} tone="a" />
              </Field>
              <Field label="Branch B">
                <BranchBadge name={data.branchB} tone="b" />
              </Field>
            </div>
          </Panel>

          <Panel className="mt-4">
            <PanelHeader title="Session" />
            <div className="grid gap-3 p-5 sm:grid-cols-3">
              <Field label="Status">
                <MergeSessionStatusChip status={data.status} />
              </Field>
              <Field label="Created">
                <p className="text-[13px] text-fg">
                  {formatDateTime(data.createdAt) ?? 'Unknown'}
                </p>
              </Field>
              <Field label="Last updated">
                <p className="flex items-center gap-1.5 text-[13px] text-fg">
                  <ClockIcon className="h-3.5 w-3.5 text-fg-faint" />
                  {formatRelativeTime(data.updatedAt) ?? 'Unknown'}
                </p>
              </Field>
            </div>
          </Panel>

          {/*
            Honest about where the product is: the session is real and stored,
            the comparison engine is the next milestone. Better than inventing
            conflicts that were never computed.
          */}
          <Panel className="mt-4 border-dashed">
            <div className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink-700 bg-ink-900 text-fg-muted">
                <GitMergeIcon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-fg">
                  Visual comparison is not built yet
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                  This session is stored and will keep its place. Branch comparison, conflict
                  detection and the visual resolver arrive in the next milestone. Until then this
                  page shows only what actually exists.
                </p>
              </div>
            </div>
          </Panel>
        </>
      )}
    </div>
  )
}
