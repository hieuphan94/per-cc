'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface SidebarNavProps {
  locale: string
}

// All 7 modules — shown in desktop sidebar (replaces bottom nav + more sheet)
const NAV_ITEMS = [
  { key: 'home',      href: '',           icon: '⚡', color: '#3DD6F5' },
  { key: 'wordpress', href: '/wordpress', icon: '🌐', color: '#22D47A' },
  { key: 'trading',   href: '/trading',   icon: '📈', color: '#F5A623' },
  { key: 'content',   href: '/content',   icon: '✍️', color: '#F472B6' },
  { key: 'dev',       href: '/dev',       icon: '💻', color: '#A78BFA' },
  { key: 'learning',  href: '/learning',  icon: '📚', color: '#60A5FA' },
  { key: 'reports',   href: '/reports',   icon: '📊', color: '#5EEAD4' },
] as const

export function SidebarNav({ locale }: SidebarNavProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-14 bottom-0 w-56
                 bg-bg-surface border-r border-border-subtle z-30 py-4 overflow-y-auto"
    >
      {/* Section label */}
      <p className="px-5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted font-ui">
        {t('modules')}
      </p>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ key, href, icon, color }) => {
          const fullHref = `/${locale}${href}`
          const isActive = href === ''
            ? pathname === fullHref
            : pathname.startsWith(fullHref)

          return (
            <Link
              key={key}
              href={fullHref}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150
                ${isActive
                  ? 'bg-bg-surface-3 text-text-primary'
                  : 'text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary'
                }`}
            >
              {/* Module icon badge */}
              <span
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ backgroundColor: `${color}${isActive ? '25' : '12'}` }}
              >
                {icon}
              </span>

              <span className="flex-1 text-sm font-medium font-ui">
                {t(key as Parameters<typeof t>[0])}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
