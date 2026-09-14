import { useStepSequence } from '../lib/hooks'
import { cn } from '../lib/utils'
import { CheckIcon, SparkIcon } from './Icons'
import { Panel } from './ui'

/** The short "model is working" moment between an instruction and a result. */
export function AiThinking({
  title,
  lines,
  caption,
}: {
  title: string
  lines: string[]
  caption?: string
}) {
  const { completed } = useStepSequence(lines.map(() => 620))

  return (
    <Panel className="mx-auto w-full max-w-xl animate-fade-up p-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative grid h-14 w-14 place-items-center">
          <span className="absolute inset-0 rounded-2xl bg-brand-500/25 animate-pulse-ring" />
          <span className="absolute inset-0 rounded-2xl border border-brand-400/30" />
          <SparkIcon className="relative h-6 w-6 text-brand-400" />
        </div>
        <h1 className="mt-5 text-[19px] font-semibold tracking-tight text-fg">{title}</h1>
        {caption ? <p className="mt-2 text-[13.5px] text-fg-muted">{caption}</p> : null}
      </div>

      <ul className="mt-6 space-y-2">
        {lines.map((line, index) => {
          const finished = index < completed
          const running = index === completed
          return (
            <li
              key={line}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13.5px] transition-all duration-300',
                finished && 'text-fg-muted',
                running && 'bg-brand-400/8 text-fg',
                !finished && !running && 'text-fg-faint opacity-40',
              )}
            >
              {finished ? (
                <CheckIcon className="h-3.5 w-3.5 shrink-0 text-merged" strokeWidth={3} />
              ) : running ? (
                <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-[1.5px] border-brand-400 border-t-transparent" />
              ) : (
                <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
              )}
              {line}
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
