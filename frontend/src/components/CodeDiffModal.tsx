import { useState } from 'react'
import type { Conflict } from '../types'
import { cn } from '../lib/utils'
import { Modal } from './Modal'
import { Button, Mono } from './ui'

type Tab = 'side-by-side' | 'raw'

function CodeBlock({ code, tone }: { code: string; tone: 'a' | 'b' | 'neutral' }) {
  return (
    <pre
      className={cn(
        'scrollbar-slim overflow-x-auto rounded-lg border bg-ink-950/70 p-4 font-mono text-[12px] leading-[1.7] whitespace-pre',
        tone === 'a' && 'border-branch-a/25',
        tone === 'b' && 'border-branch-b/25',
        tone === 'neutral' && 'border-ink-700',
      )}
    >
      <code className="text-fg-muted">{code}</code>
    </pre>
  )
}

/** The optional, deliberately secondary code view. */
export function CodeDiffModal({
  conflict,
  open,
  onClose,
}: {
  conflict: Conflict
  open: boolean
  onClose: () => void
}) {
  const [tab, setTab] = useState<Tab>('side-by-side')

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Code Diff"
      subtitle={<Mono>{conflict.codeDiff.filePath}</Mono>}
      className="max-w-4xl"
      footer={
        <>
          <p className="mr-auto text-[12.5px] text-fg-faint">
            Code is the fallback view — VisualMerge resolves this visually.
          </p>
          <Button onClick={onClose}>Close</Button>
        </>
      }
    >
      <div className="flex items-center gap-1 border-b border-ink-700 px-5 py-2.5">
        {(
          [
            { id: 'side-by-side', label: 'Side by side' },
            { id: 'raw', label: 'Raw conflict markers' },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setTab(option.id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-[13px] transition',
              tab === option.id
                ? 'bg-ink-800 font-medium text-fg'
                : 'text-fg-muted hover:bg-ink-800/60 hover:text-fg',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === 'side-by-side' ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[11.5px] text-branch-a">
                ganpati-theme · Branch A
              </p>
              <CodeBlock code={conflict.codeDiff.branchA} tone="a" />
            </div>
            <div>
              <p className="mb-2 font-mono text-[11.5px] text-branch-b">
                navbar-feature · Branch B
              </p>
              <CodeBlock code={conflict.codeDiff.branchB} tone="b" />
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-[12.5px] text-fg-muted">
              This is what Git would have handed you instead:
            </p>
            <CodeBlock code={conflict.codeDiff.conflictMarkers} tone="neutral" />
          </div>
        )}
      </div>
    </Modal>
  )
}
