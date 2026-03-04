'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  locale: string
}

// Locale switcher — keeps current page when switching vi ↔ en
// Replaces the locale prefix in the pathname instead of going to root
export function LocaleSwitcher({ locale }: Props) {
  const pathname = usePathname()
  const targetLocale = locale === 'vi' ? 'en' : 'vi'

  // Swap /vi/... → /en/... (or vice versa), preserve the rest of the path
  const targetPath = pathname.replace(/^\/(vi|en)/, `/${targetLocale}`)

  return (
    <Link
      href={targetPath}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-surface-2
                 border border-border-muted text-xs font-medium text-text-secondary font-ui
                 active:bg-bg-surface-3 transition-colors min-h-[44px]"
      aria-label="Switch language"
    >
      <span className={locale === 'vi' ? 'text-accent' : 'text-text-muted'}>VI</span>
      <span className="text-text-muted">/</span>
      <span className={locale === 'en' ? 'text-accent' : 'text-text-muted'}>EN</span>
    </Link>
  )
}
