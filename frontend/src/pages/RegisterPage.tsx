import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { VisualMergeMark } from '../components/AppShell'
import { GithubIcon, UserIcon, MailIcon, KeyIcon, ArrowRightIcon } from '../components/Icons'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (password.length === 0) return { level: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-danger' }
  if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-warn' }
  if (score <= 3) return { level: 3, label: 'Good', color: 'bg-brand-400' }
  return { level: 4, label: 'Strong', color: 'bg-merged' }
}

export function RegisterPage() {
  const { register, loginWithGitHub } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const strength = useMemo(() => getPasswordStrength(password), [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) return
    setError(null)
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/dashboard')
    } catch {
      setError('Registration failed. Please try again.')
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
            Build better merges.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
            Connect your repositories and resolve conflicts visually.
            No more guessing what the merge will look like.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { value: 'Visual', label: 'Branch comparison' },
              { value: 'AI', label: 'Conflict resolution' },
              { value: 'Real', label: 'Git integration' },
              { value: 'Verified', label: 'Merge output' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-ink-700 bg-ink-850/60 px-3 py-2.5">
                <p className="text-[14px] font-semibold text-brand-400">{item.value}</p>
                <p className="text-[12px] text-fg-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-fg-faint">© 2026 VisualMerge</p>
      </div>

      {/* Right panel — Register form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-ink-950 px-5 py-10">
        {/* Mobile logo */}
        <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <VisualMergeMark size={30} />
          <span className="text-[16px] font-semibold tracking-tight text-fg">VisualMerge</span>
        </Link>

        <div className="w-full max-w-[380px]">
          <h1 className="text-[24px] font-bold tracking-tight text-fg">Create your account</h1>
          <p className="mt-2 text-[14px] text-fg-muted">Connect your repositories and resolve conflicts visually.</p>

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
              <span className="bg-ink-950 px-3 text-fg-faint">or create with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="mb-1.5 block text-[13px] font-medium text-fg-muted">
                Name
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fg-faint" />
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className={cn(
                    'h-11 w-full rounded-lg border border-ink-600 bg-ink-900 pr-3 pl-10',
                    'text-[14px] text-fg placeholder:text-fg-faint',
                    'transition outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
                  )}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-[13px] font-medium text-fg-muted">
                Email
              </label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fg-faint" />
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password" className="mb-1.5 block text-[13px] font-medium text-fg-muted">
                Password
              </label>
              <div className="relative">
                <KeyIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fg-faint" />
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={cn(
                    'h-11 w-full rounded-lg border border-ink-600 bg-ink-900 pr-3 pl-10',
                    'text-[14px] text-fg placeholder:text-fg-faint',
                    'transition outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
                  )}
                />
              </div>
              {/* Strength indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          i <= strength.level ? strength.color : 'bg-ink-700',
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn(
                    'mt-1 text-[11px]',
                    strength.level <= 1 && 'text-danger',
                    strength.level === 2 && 'text-warn',
                    strength.level === 3 && 'text-brand-400',
                    strength.level >= 4 && 'text-merged',
                  )}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || !email.trim() || !password.trim()}
              className={cn(
                'flex h-11 w-full items-center justify-center gap-2 rounded-lg font-medium transition',
                'bg-brand-500 text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_8px_22px_-10px_rgba(91,131,240,0.9)]',
                'hover:bg-brand-400',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {loading ? 'Creating account…' : 'Create account'}
              {!loading && <ArrowRightIcon className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-fg-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-400 transition hover:text-brand-300">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
