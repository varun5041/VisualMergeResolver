import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { VisualMergeMark } from '../components/AppShell'
import { GithubIcon, MailIcon, KeyIcon, ArrowRightIcon } from '../components/Icons'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { login, loginWithGitHub } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGitHub = async () => {
    setLoading(true)
    try {
      await loginWithGitHub()
      navigate('/dashboard')
    } catch {
      setError('GitHub authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — Branding */}
      <div className="hidden flex-1 flex-col justify-between border-r border-ink-800 bg-ink-900/60 p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <VisualMergeMark size={30} />
          <span className="text-[16px] font-semibold tracking-tight text-fg">VisualMerge</span>
        </Link>

        <div className="max-w-[400px]">
          <h2 className="text-[28px] leading-tight font-bold tracking-tight text-fg">
            Resolve conflicts by seeing the result, not reading the diff.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
            VisualMerge shows you what each branch actually looks like, lets you describe
            the result you want, and creates a verified merge.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'See both branches as running applications',
              'Describe what you want to keep from each',
              'AI resolves the code, you approve the result',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-400">
                  <ArrowRightIcon className="h-3 w-3" />
                </span>
                <span className="text-[13.5px] text-fg-muted">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-fg-faint">© 2026 VisualMerge</p>
      </div>

      {/* Right panel — Login form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-ink-950 px-5 py-10">
        {/* Mobile logo */}
        <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <VisualMergeMark size={30} />
          <span className="text-[16px] font-semibold tracking-tight text-fg">VisualMerge</span>
        </Link>

        <div className="w-full max-w-[380px]">
          <h1 className="text-[24px] font-bold tracking-tight text-fg">Welcome back</h1>
          <p className="mt-2 text-[14px] text-fg-muted">Continue resolving conflicts visually.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-danger/30 bg-danger/8 px-4 py-3 text-[13px] text-danger">
              {error}
            </div>
          )}

          {/* GitHub */}
          <button
            type="button"
            onClick={handleGitHub}
            disabled={loading}
            className={cn(
              'mt-6 flex h-11 w-full items-center justify-center gap-3 rounded-lg font-medium transition',
              'border border-ink-600 bg-ink-800 text-fg hover:border-ink-500 hover:bg-ink-750',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <GithubIcon className="h-5 w-5" />
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-700" />
            </div>
            <div className="relative flex justify-center text-[12px]">
              <span className="bg-ink-950 px-3 text-fg-faint">or continue with email</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-[13px] font-medium text-fg-muted">
                Email
              </label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fg-faint" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={cn(
                    'h-11 w-full rounded-lg border border-ink-600 bg-ink-900 pr-3 pl-10',
                    'text-[14px] text-fg placeholder:text-fg-faint',
                    'transition outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
                  )}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="login-password" className="text-[13px] font-medium text-fg-muted">
                  Password
                </label>
                <a href="#" className="text-[12px] text-brand-400 transition hover:text-brand-300">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <KeyIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fg-faint" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    'h-11 w-full rounded-lg border border-ink-600 bg-ink-900 pr-3 pl-10',
                    'text-[14px] text-fg placeholder:text-fg-faint',
                    'transition outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
                  )}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className={cn(
                'flex h-11 w-full items-center justify-center rounded-lg font-medium transition',
                'bg-brand-500 text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_8px_22px_-10px_rgba(91,131,240,0.9)]',
                'hover:bg-brand-400',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-fg-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-400 transition hover:text-brand-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
