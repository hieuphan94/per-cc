import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import type { NotificationLog } from '@/lib/supabase/types'
import { GenerateReportButton } from './generate-report-button'

type NotifLogRow = Pick<
  NotificationLog,
  'id' | 'channel' | 'notif_type' | 'status' | 'error_msg' | 'sent_at'
>

interface ReportsPageProps {
  params: { locale: string }
}

const CHANNEL_ICONS: Record<string, string> = {
  telegram: '✈',
  email:    '✉',
}

const STATUS_STYLES: Record<string, string> = {
  sent:    'bg-[#22D47A18] text-success',
  failed:  'bg-[#F5564A18] text-danger',
  skipped: 'bg-[#F5A62318] text-warning',
}

const FILTER_TABS = ['all', 'sent', 'failed'] as const
type FilterTab = typeof FILTER_TABS[number]

// Server component — filter is passed via searchParams
interface SearchParams { filter?: string }

export default async function ReportsPage({
  params,
  searchParams,
}: ReportsPageProps & { searchParams?: SearchParams }) {
  void params
  const t = await getTranslations('reports')
  const supabase = await createClient()

  const activeFilter = (searchParams?.filter ?? 'all') as FilterTab

  let query = supabase
    .from('notification_logs')
    .select('id, channel, notif_type, status, error_msg, sent_at')
    .order('sent_at', { ascending: false })
    .limit(10)

  if (activeFilter === 'sent' || activeFilter === 'failed') {
    query = query.eq('status', activeFilter)
  }

  const { data } = await query
  const logs = (data ?? []) as NotifLogRow[]

  return (
    <div className="space-y-4 pt-4">

      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-mod-reports font-ui mb-0.5">
          {t('moduleLabel')}
        </p>
        <p className="text-lg font-semibold text-text-primary font-ui">{t('title')}</p>
      </div>

      {/* EOD report generator */}
      <GenerateReportButton
        labelGenerate={t('generateEod')}
        labelSent={t('reportSent')}
        labelSkipped={t('reportGenerated')}
      />

      {/* Status filter tabs */}
      <div className="flex items-center gap-2">
        {FILTER_TABS.map((tab) => (
          <a
            key={tab}
            href={tab === 'all' ? '?' : `?filter=${tab}`}
            className={`text-[11px] font-semibold uppercase px-3 py-1.5 rounded-xl font-ui transition-colors ${
              activeFilter === tab
                ? 'bg-mod-reports/10 text-mod-reports border border-mod-reports/30'
                : 'bg-bg-surface border border-border-subtle text-text-muted'
            }`}
          >
            {t(`filter${tab.charAt(0).toUpperCase()}${tab.slice(1)}` as Parameters<typeof t>[0])}
          </a>
        ))}
      </div>

      {/* Notification log list */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('notifLog')}
        </p>

        {logs.length === 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 text-center">
            <p className="text-sm text-text-muted font-ui">{t('noLogs')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5
                           flex items-start gap-3"
              >
                {/* Channel icon */}
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-bg-surface-3 text-text-secondary
                                 flex items-center justify-center text-sm font-ui">
                  {CHANNEL_ICONS[log.channel] ?? '?'}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary font-ui truncate">
                    {log.notif_type}
                  </p>
                  <p className="text-[10px] text-text-muted font-data mt-0.5 capitalize">
                    {log.channel} · {format(new Date(log.sent_at), 'HH:mm dd/MM/yyyy')}
                  </p>
                  {log.status === 'failed' && log.error_msg && (
                    <p className="text-[10px] text-danger font-data mt-0.5 truncate">
                      {log.error_msg}
                    </p>
                  )}
                </div>

                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui flex-shrink-0 ${
                  STATUS_STYLES[log.status] ?? 'bg-bg-surface-3 text-text-muted'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
