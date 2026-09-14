import type { MergeRequest } from '../types'
import { cn } from '../lib/utils'
import {
  CheckIcon,
  ExternalLinkIcon,
  FileIcon,
  GitPullRequestIcon,
  ShieldCheckIcon,
} from './Icons'
import { Modal } from './Modal'
import { Button, Chip, Mono } from './ui'

export function MergeRequestModal({
  mergeRequest,
  open,
  onClose,
}: {
  mergeRequest: MergeRequest
  open: boolean
  onClose: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-3xl"
      title={
        <span className="flex items-center gap-2.5">
          <GitPullRequestIcon className="h-4.5 w-4.5 text-merged" />
          {mergeRequest.title}
          <Chip tone="merged">Open</Chip>
        </span>
      }
      subtitle={
        <span className="flex flex-wrap items-center gap-2">
          <Mono className="text-branch-a">{mergeRequest.sourceBranch}</Mono>
          <span className="text-fg-faint">→</span>
          <Mono className="text-fg-muted">{mergeRequest.targetBranch}</Mono>
          <span className="text-fg-faint">·</span>
          <span>#{mergeRequest.number}</span>
        </span>
      }
      footer={
        <>
          <p className="mr-auto text-[12.5px] text-fg-faint">
            Prototype — no pull request is actually created.
          </p>
          <Button onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={onClose}>
            <ExternalLinkIcon className="h-4 w-4" />
            Open in repository
          </Button>
        </>
      }
    >
      <div className="space-y-5 p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Chip tone="neutral">{mergeRequest.filesChanged} files changed</Chip>
          <Chip tone="merged">+{mergeRequest.additions}</Chip>
          <Chip tone="danger">−{mergeRequest.deletions}</Chip>
          <Chip tone="brand">{mergeRequest.commits.length} commits</Chip>
        </div>

        <div className="rounded-lg border border-ink-700 bg-ink-900/50 p-4">
          <p className="text-[13.5px] leading-relaxed whitespace-pre-line text-fg-muted">
            {mergeRequest.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-merged/25 bg-merged/8 px-4 py-3">
          <ShieldCheckIcon className="h-4.5 w-4.5 shrink-0 text-merged" />
          <p className="text-[13px] text-fg">
            <span className="font-semibold">All visual checks passed.</span>{' '}
            <span className="text-fg-muted">
              Build, UI, interactions and responsive layout were verified on the merged build.
            </span>
          </p>
        </div>

        <div>
          <p className="mb-2.5 text-[12px] font-semibold tracking-wide text-fg-muted uppercase">
            Commits
          </p>
          <ul className="space-y-1.5">
            {mergeRequest.commits.map((commit) => (
              <li
                key={commit.hash}
                className="flex items-center justify-between gap-4 rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-2.5"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <CheckIcon className="h-3.5 w-3.5 shrink-0 text-merged" strokeWidth={3} />
                  <span className="truncate text-[13px] text-fg">{commit.message}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3 text-[12px] text-fg-faint">
                  <span>{commit.author}</span>
                  <Mono className="text-fg-muted">{commit.hash}</Mono>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2.5 text-[12px] font-semibold tracking-wide text-fg-muted uppercase">
            Files changed
          </p>
          <ul className="space-y-1.5">
            {mergeRequest.files.map((file) => (
              <li
                key={file.path}
                className="flex items-center justify-between gap-4 rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-2.5"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <FileIcon className="h-3.5 w-3.5 shrink-0 text-fg-faint" />
                  <Mono className="truncate text-fg">{file.path}</Mono>
                  <span
                    className={cn(
                      'shrink-0 text-[11px]',
                      file.status === 'added' ? 'text-merged' : 'text-fg-faint',
                    )}
                  >
                    {file.status}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2.5 font-mono text-[12px]">
                  <span className="text-merged">+{file.additions}</span>
                  <span className="text-danger">−{file.deletions}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  )
}
