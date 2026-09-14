import { Link, useSearchParams } from 'react-router-dom'
import { VisualMergeMark } from '../components/Logo'
import { AlertIcon, CheckIcon, GithubIcon, ShieldCheckIcon } from '../components/Icons'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/utils'

const ASSURANCES = [
  'VisualMerge reads the repositories your GitHub account already has.',
  'Your GitHub token stays on the VisualMerge server. It is never sent to the browser.',
  'Nothing is pushed, merged or opened as a pull request without you.',
]

export function LoginPage() {
  const { loginWithGitHub, isLoading, error } = useAuth()
  const [searchParams] = useSearchParams()
  const githubFailed = searchParams.get('error') === 'github'

  return (
    <div className="flex min-h-screen">
      {/* ── Left: what signing in gets you ── */}
      <div className="hidden flex-1 flex-col justify-between border-r border-ink-800 bg-ink-900/60 p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <VisualMergeMark size={30} />
          <span className="text-[16px] font-semibold tracking-tight text-fg">VisualMerge</span>
        </Link>

        <div className="max-w-[420px]">
          <h2 className="text-[28px] leading-tight font-bold tracking-tight text-fg">
            Resolve conflicts by seeing the result, not reading the diff.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
            VisualMerge works on your real repositories and your real branches. There is no demo
            workspace to get lost in.
          </p>
          <ul className="mt-8 space-y-3">
            {ASSURANCES.map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-merged/15 text-merged">
                  <CheckIcon className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-[13.5px] leading-relaxed text-fg-muted">{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="flex items-center gap-2 text-[12.5px] text-fg-faint">
          <ShieldCheckIcon className="h-4 w-4" />
          GitHub handles the sign-in. VisualMerge never sees your password.
        </p>
      </div>

      {/* ── Right: the one way in ── */}
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[380px]">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <VisualMergeMark size={28} />
            <span className="text-[15px] font-semibold tracking-tight text-fg">VisualMerge</span>
          </Link>

          <h1 className="text-[24px] font-bold tracking-tight text-fg">Sign in to VisualMerge</h1>
          <p className="mt-2 text-[14px] text-fg-muted">
            VisualMerge uses your GitHub account as its identity, so your repositories and branches
            are there the moment you land.
          </p>

          {githubFailed && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/[0.06] p-4"
            >
              <AlertIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-danger" />
              <p className="text-[13px] text-fg">
                GitHub did not complete the sign-in. Nothing was changed, so you can try again.
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-3 rounded-lg border border-warn/30 bg-warn/[0.06] p-4"
            >
              <AlertIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-warn" />
              <div>
                <p className="text-[13px] font-medium text-fg">{error.message}</p>
                <p className="mt-0.5 font-mono text-[11.5px] text-fg-faint">{error.code}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={loginWithGitHub}
            disabled={isLoading}
            className={cn(
              'mt-6 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-[15px] font-semibold transition',
              'bg-fg text-ink-950 hover:bg-white',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <GithubIcon className="h-5 w-5" />
            Continue with GitHub
          </button>

          <p className="mt-4 text-center text-[12.5px] leading-relaxed text-fg-faint">
            VisualMerge asks GitHub for read access to your profile and repositories so it can list
            them and read their branches.
          </p>

          <p className="mt-8 text-center text-[13px] text-fg-muted">
            New to VisualMerge? Signing in with GitHub creates your account.
          </p>
        </div>
      </div>
    </div>
  )
}
