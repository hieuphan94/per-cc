'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const t = useTranslations('auth')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const usePassword = password.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    if (usePassword) {
      // Password login — no email sent, no rate limits
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) setError(authError.message)
      // on success middleware redirects automatically
    } else {
      // Magic link — sends email
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
      })
      if (authError) setError(authError.message)
      else setSent(true)
    }

    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center space-y-2 py-4">
        <div className="flex justify-center">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-40" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
          </span>
        </div>
        <p className="text-sm font-semibold text-text-primary font-ui">{t('checkEmail')}</p>
        <p className="text-xs text-text-secondary font-ui">{email}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email"
          className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
          {t('email')}
        </label>
        <input
          id="email" type="email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="commander@example.com"
          className="w-full bg-bg-surface-2 border border-border-muted rounded-xl px-4 py-3
                     text-sm text-text-primary placeholder-text-muted font-ui
                     focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
                     transition-colors duration-150"
        />
      </div>

      {/* Password — optional, fills in to bypass magic link */}
      <div className="space-y-1.5">
        <label htmlFor="password"
          className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
          {t('password')}
          <span className="ml-1.5 normal-case text-text-muted font-normal">({t('passwordOptional')})</span>
        </label>
        <input
          id="password" type="password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-bg-surface-2 border border-border-muted rounded-xl px-4 py-3
                     text-sm text-text-primary placeholder-text-muted font-ui
                     focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
                     transition-colors duration-150"
        />
      </div>

      {error && <p className="text-xs text-danger font-ui">{error}</p>}

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full bg-accent text-bg-base font-semibold text-sm rounded-xl py-3 px-4
                   font-ui active:scale-[0.98] transition-transform duration-100
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {loading ? '...' : usePassword ? t('login') : t('magicLink')}
      </button>
    </form>
  )
}
