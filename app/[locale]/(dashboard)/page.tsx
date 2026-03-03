import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { vi as viLocale, enUS } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { fetchBriefingTasks } from '@/lib/google-sheets'
import { BriefingAiSummary, BriefingAiSummarySkeleton } from './briefing-ai-summary'
import type { WordPressSite, TradingEntry } from '@/lib/supabase/types'

// Minimal row shapes needed for this page
type WpAlertRow = Pick<WordPressSite, 'name' | 'url' | 'last_status'>
type TradingSessionRow = Pick<TradingEntry, 'session'>

interface HomePageProps {
  params: { locale: string }
}

const TRADING_SESSIONS = ['morning', 'afternoon', 'evening'] as const

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params
  const t = await getTranslations()
  const dateLocale = locale === 'vi' ? viLocale : enUS
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const dayOfWeek = format(now, 'EEEE', { locale: dateLocale })
  const dateStr = format(now, 'dd/MM/yyyy', { locale: dateLocale })

  // Fetch all data sources in parallel — explicit types avoid Supabase inference edge cases
  const supabase = await createClient()

  const [tasks, wpResult, tradingResult] = await Promise.all([
    fetchBriefingTasks().catch(() => []),
    supabase
      .from('wordpress_sites')
      .select('name, url, last_status')
      .neq('last_status', 'online')
      .eq('is_active', true),
    supabase
      .from('trading_entries')
      .select('session')
      .eq('entry_date', today),
  ])

  const wpAlerts   = (wpResult.data   ?? []) as WpAlertRow[]
  const tradingRows = (tradingResult.data ?? []) as TradingSessionRow[]
  const loggedSessions = new Set(tradingRows.map((e) => e.session))

  return (
    <div className="space-y-4 pt-4">

      {/* Header card */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
          {dayOfWeek}
        </p>
        <p className="text-lg font-semibold text-text-primary font-ui leading-snug">
          {t('home.greeting')}
        </p>
        <p className="text-xs text-text-secondary font-data">{dateStr}</p>
      </div>

      {/* AI Focus summary — resolves independently, doesn't block rest of page */}
      {tasks.length > 0 && (
        <Suspense fallback={<BriefingAiSummarySkeleton />}>
          <BriefingAiSummary tasks={tasks} />
        </Suspense>
      )}

      {/* Today's tasks */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('briefing.tasks')}
        </p>

        {tasks.length === 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4
                          text-sm text-text-muted font-ui text-center">
            {t('briefing.noTasks')}
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div
                key={task.rowId}
                className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5
                           flex items-start gap-3"
              >
                {/* Priority index badge */}
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#3DD6F518] text-accent
                                 text-[11px] font-bold font-data flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary font-ui">{task.title}</p>
                  {task.notes && (
                    <p className="text-xs text-text-muted font-ui mt-0.5">{task.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* WordPress site alerts */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('briefing.sites')}
        </p>

        {!wpAlerts || wpAlerts.length === 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5
                          flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
            <p className="text-sm text-text-secondary font-ui">{t('briefing.allClear')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {wpAlerts.map((site) => (
              <div
                key={site.url}
                className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5
                           flex items-center gap-3"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  site.last_status === 'offline' ? 'bg-danger' : 'bg-warning'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary font-ui truncate">{site.name}</p>
                  <p className="text-[11px] text-text-muted font-data truncate">{site.url}</p>
                </div>
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui ${
                  site.last_status === 'offline'
                    ? 'bg-[#F5564A18] text-danger'
                    : 'bg-[#F5A62318] text-warning'
                }`}>
                  {site.last_status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trading session status */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('briefing.trading')}
        </p>
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5
                        flex items-center justify-around">
          {TRADING_SESSIONS.map((session) => {
            const logged = loggedSessions.has(session)
            return (
              <div key={session} className="flex flex-col items-center gap-1.5">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-base ${
                  logged ? 'bg-[#22D47A18] text-success' : 'bg-bg-surface-3 text-text-muted'
                }`}>
                  {logged ? '✓' : '—'}
                </span>
                <span className="text-[10px] font-medium font-ui text-text-muted capitalize">
                  {session}
                </span>
              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}
