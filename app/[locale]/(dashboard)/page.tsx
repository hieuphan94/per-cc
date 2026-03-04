import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

interface HomePageProps {
  params: { locale: string }
}

// Module cards configuration — accent colors from tailwind config
const MODULES = [
  {
    key: 'briefing',
    icon: '⚡',
    nameKey: 'home.briefing' as const,
    href: 'briefing',
    color: '#3DD6F5',
    bg: '#3DD6F518',
  },
  {
    key: 'wordpress',
    icon: '🌐',
    nameKey: 'wordpress.title' as const,
    href: 'wordpress',
    color: '#22D47A',
    bg: '#22D47A18',
  },
  {
    key: 'trading',
    icon: '📈',
    nameKey: 'trading.title' as const,
    href: 'trading',
    color: '#F5A623',
    bg: '#F5A62318',
  },
  {
    key: 'dev',
    icon: '💻',
    nameKey: 'dev.title' as const,
    href: 'dev',
    color: '#A78BFA',
    bg: '#A78BFA18',
  },
  {
    key: 'content',
    icon: '✍️',
    nameKey: 'content.title' as const,
    href: 'content',
    color: '#F472B6',
    bg: '#F472B618',
  },
  {
    key: 'learning',
    icon: '📚',
    nameKey: 'learning.title' as const,
    href: 'learning',
    color: '#60A5FA',
    bg: '#60A5FA18',
  },
] as const

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params
  const t = await getTranslations()

  const dateLocale = locale === 'vi' ? vi : enUS
  const now = new Date()
  const dayOfWeek = format(now, 'EEEE', { locale: dateLocale })
  const dateStr = format(now, 'dd/MM/yyyy', { locale: dateLocale })

  return (
    <div className="space-y-5 pt-4">
      {/* Welcome card */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
          {dayOfWeek}
        </p>
        <p className="text-lg font-semibold text-text-primary font-ui leading-snug">
          {t('home.greeting')}
        </p>
        <p className="text-xs text-text-secondary font-data">{dateStr}</p>
      </div>

      {/* Quick access section label */}
      <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
        {t('home.quickStats')}
      </p>

      {/* 2-column module grid */}
      <div className="grid grid-cols-2 gap-3">
        {MODULES.map(({ key, icon, nameKey, href, color, bg }) => {
          const isLive = key === 'briefing'
          const cardClass = `bg-bg-surface border border-border-subtle rounded-2xl p-4
                             active:bg-bg-surface-3 transition-colors duration-150 cursor-pointer
                             flex flex-col gap-3 min-h-[100px]`
          const cardContent = (
            <>
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: bg }}
              >
                {icon}
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium text-text-primary font-ui leading-snug">
                  {t(nameKey)}
                </p>
                {!isLive && (
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium font-ui"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    Coming soon
                  </span>
                )}
              </div>
            </>
          )

          return isLive ? (
            <Link key={key} href={`/${locale}/${href}`} className={cardClass}>
              {cardContent}
            </Link>
          ) : (
            <div key={key} className={cardClass}>
              {cardContent}
            </div>
          )
        })}
      </div>
    </div>
  )
}
