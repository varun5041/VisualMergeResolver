import { cn } from '../lib/utils'
import { GitBranchIcon } from './Icons'

type Tone = 'a' | 'b' | 'base' | 'merged'

const toneStyles: Record<Tone, string> = {
  a: 'border-branch-a/35 bg-branch-a/10 text-branch-a',
  b: 'border-branch-b/35 bg-branch-b/10 text-branch-b',
  base: 'border-ink-600 bg-ink-800 text-fg-muted',
  merged: 'border-merged/35 bg-merged/10 text-merged',
}

export function BranchBadge({
  name,
  label,
  tone,
  size = 'md',
  className,
}: {
  name: string
  label?: string
  tone: Tone
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-md border font-mono',
        size === 'sm' ? 'px-2 py-0.5 text-[11.5px]' : 'px-2.5 py-1 text-[12.5px]',
        toneStyles[tone],
        className,
      )}
    >
      <GitBranchIcon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label ? (
        <span className="font-sans text-[11px] font-semibold tracking-wide uppercase opacity-70">
          {label}
        </span>
      ) : null}
      {name}
    </span>
  )
}
