'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { MoreSheet } from './more-sheet'

interface BottomNavProps {
  locale: string
}

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke={active ? '#3DD6F5' : '#4A5A6E'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconWordPress({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke={active ? '#22D47A' : '#4A5A6E'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function IconTrading({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke={active ? '#F5A623' : '#4A5A6E'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

function IconContent({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke={active ? '#F472B6' : '#4A5A6E'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function IconMore({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke={active ? '#3DD6F5' : '#4A5A6E'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

export function BottomNav({ locale }: BottomNavProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const tabs = [
    { key: 'home',      href: `/${locale}`,           label: t('home'),      Icon: IconHome      },
    { key: 'wordpress', href: `/${locale}/wordpress`, label: t('wordpress'), Icon: IconWordPress },
    { key: 'trading',   href: `/${locale}/trading`,   label: t('trading'),   Icon: IconTrading   },
    { key: 'content',   href: `/${locale}/content`,   label: t('content'),   Icon: IconContent   },
  ] as const

  return (
    <>
      <MoreSheet locale={locale} open={showMore} onClose={() => setShowMore(false)} />

      <nav
        className="fixed bottom-0 left-0 right-0 z-50
                   bg-bg-surface/95 backdrop-blur-md
                   border-t border-border-subtle"
        aria-label="Main navigation"
      >
        <div className="max-w-mobile mx-auto flex items-center justify-around px-2 h-16">
          {tabs.map(({ key, href, label, Icon }) => {
            const isActive = key === 'home'
              ? pathname === href
              : pathname.startsWith(href)

            return (
              <Link
                key={key}
                href={href}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
              >
                <Icon active={isActive} />
                <span className={`text-[10px] font-medium font-ui ${isActive ? 'text-accent' : 'text-text-muted'}`}>
                  {label}
                </span>
              </Link>
            )
          })}

          {/* More tab — toggles bottom sheet */}
          <button
            onClick={() => setShowMore((prev) => !prev)}
            aria-label={t('more')}
            aria-expanded={showMore}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
          >
            <IconMore active={showMore} />
            <span className={`text-[10px] font-medium font-ui ${showMore ? 'text-accent' : 'text-text-muted'}`}>
              {t('more')}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
