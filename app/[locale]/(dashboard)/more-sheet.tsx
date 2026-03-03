'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface MoreSheetProps {
  locale: string
  open: boolean
  onClose: () => void
}

interface SheetItem {
  href: string
  icon: string
  labelKey: 'dev' | 'learning' | 'reports'
  color: string
}

const SHEET_ITEMS: SheetItem[] = [
  { href: 'dev',      icon: '💻', labelKey: 'dev',      color: '#A78BFA' },
  { href: 'learning', icon: '📚', labelKey: 'learning', color: '#60A5FA' },
  { href: 'reports',  icon: '📊', labelKey: 'reports',  color: '#5EEAD4' },
]

// Bottom sheet that slides up when "More" tab is tapped
export function MoreSheet({ locale, open, onClose }: MoreSheetProps) {
  const t = useTranslations('nav')

  if (!open) return null

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel — sits above bottom nav (bottom-16 = 64px) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('more')}
        className="fixed bottom-16 left-0 right-0 z-40
                   bg-bg-surface border-t border-border-subtle rounded-t-2xl p-4
                   transition-transform duration-300 ease-out"
      >
        {/* Sheet handle */}
        <div className="flex justify-center mb-4">
          <div className="w-8 h-1 rounded-full bg-border-muted" />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-3">
          {t('more')}
        </p>

        <div className="space-y-2">
          {SHEET_ITEMS.map(({ href, icon, labelKey, color }) => (
            <Link
              key={href}
              href={`/${locale}/${href}`}
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg-surface-2
                         border border-border-subtle
                         active:bg-bg-surface-3 transition-colors duration-150
                         min-h-[44px]"
            >
              {/* Module color dot */}
              <span
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{ backgroundColor: `${color}18` }}
              >
                {icon}
              </span>

              <span className="flex-1 text-sm font-medium text-text-primary font-ui">
                {t(labelKey)}
              </span>

              {/* Chevron right */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                stroke="#4A5A6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
