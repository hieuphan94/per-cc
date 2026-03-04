import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import { LocaleSwitcher } from './locale-switcher'
import { signOut } from './actions'

interface TopBarProps {
  locale: string
}

// Sign-out icon button — uses server action via form
function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        aria-label="Sign out"
        className="p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-bg-surface-3
                   transition-colors duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        {/* Power / logout icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </form>
  )
}

export async function TopBar({ locale }: TopBarProps) {
  const t = await getTranslations()
  const dateLocale = locale === 'vi' ? vi : enUS

  const now = new Date()
  const dateStr = format(now, 'EEEE, dd/MM', { locale: dateLocale })

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-bg-base/90 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-mobile mx-auto flex items-center justify-between px-4 h-14 lg:max-w-none lg:px-6">
        {/* Date + greeting */}
        <div>
          <p className="text-[11px] text-text-muted font-ui uppercase tracking-wider">
            {dateStr}
          </p>
          <p className="text-sm font-semibold text-text-primary font-ui">
            {t('home.greeting')}
          </p>
        </div>

        {/* Right actions: language toggle + sign-out */}
        <div className="flex items-center gap-1">
          <LocaleSwitcher locale={locale} />

          <SignOutButton />
        </div>
      </div>
    </header>
  )
}
