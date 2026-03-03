import { useTranslations } from 'next-intl'
import { LoginForm } from './login-form'

export default function LoginPage() {
  const t = useTranslations()

  return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-[380px] space-y-8">
        {/* Logo / wordmark */}
        <div className="text-center space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
            Personal Command Center
          </p>
          <h1 className="text-2xl font-semibold text-text-primary font-ui">
            per-cc
          </h1>
        </div>

        {/* Login card */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary font-ui">
              {t('auth.login')}
            </h2>
            <p className="text-sm text-text-secondary font-ui">
              {t('auth.loginDesc')}
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  )
}
