// Dashboard home — 7 module widgets

import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import { BriefingDevTasksWidget } from './briefing/briefing-dev-tasks-widget'

interface HomePageProps {
  params: { locale: string }
}

// Placeholder for modules not yet built
function ComingSoonWidget({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden opacity-60">
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="text-base">{icon}</span>
        <p className="text-[11px] font-semibold uppercase tracking-widest font-ui" style={{ color }}>
          {label}
        </p>
        <span className="ml-auto text-[10px] font-medium font-ui text-text-muted
                         bg-bg-surface-3 px-1.5 py-0.5 rounded-full">
          Coming soon
        </span>
      </div>
    </div>
  )
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params
  const t = await getTranslations()
  const dateLocale = locale === 'vi' ? vi : enUS
  const now = new Date()

  return (
    <div className="space-y-3 pt-4 pb-6">
      {/* Welcome */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
          {format(now, 'EEEE', { locale: dateLocale })} · {format(now, 'dd/MM/yyyy')}
        </p>
        <p className="text-lg font-semibold text-text-primary font-ui leading-snug mt-0.5">
          {t('home.greeting')}
        </p>
      </div>

      {/* 1 — Dev Tracker */}
      <BriefingDevTasksWidget locale={locale} />

      {/* 3 — WordPress Monitor */}
      <ComingSoonWidget icon="🌐" label={t('wordpress.moduleLabel')} color="#22D47A" />

      {/* 4 — Trading Journal */}
      <ComingSoonWidget icon="📈" label={t('trading.moduleLabel')} color="#F5A623" />

      {/* 5 — Content Pipeline */}
      <ComingSoonWidget icon="✍️" label={t('content.moduleLabel')} color="#F472B6" />

      {/* 6 — Learning Tracker */}
      <ComingSoonWidget icon="📚" label={t('learning.moduleLabel')} color="#60A5FA" />

      {/* 7 — Auto Reports */}
      <ComingSoonWidget icon="📊" label={t('reports.moduleLabel')} color="#A78BFA" />
    </div>
  )
}
