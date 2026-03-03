import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import type { WordPressSite } from '@/lib/supabase/types'

type WpSiteRow = Pick<WordPressSite, 'id' | 'name' | 'url' | 'last_status' | 'last_checked_at'>

interface WordPressPageProps {
  params: { locale: string }
}

function StatusDot({ status }: { status: WordPressSite['last_status'] }) {
  const colorMap: Record<string, string> = {
    online:  'bg-success',
    offline: 'bg-danger',
    warning: 'bg-warning',
  }
  const color = status ? (colorMap[status] ?? 'bg-text-muted') : 'bg-text-muted'
  return <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
}

function StatusBadge({ status }: { status: WordPressSite['last_status'] }) {
  const styleMap: Record<string, string> = {
    online:  'bg-[#22D47A18] text-success',
    offline: 'bg-[#F5564A18] text-danger',
    warning: 'bg-[#F5A62318] text-warning',
  }
  const cls = status ? (styleMap[status] ?? 'bg-bg-surface-3 text-text-muted') : 'bg-bg-surface-3 text-text-muted'
  return (
    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui ${cls}`}>
      {status ?? 'unknown'}
    </span>
  )
}

export default async function WordPressPage({ params }: WordPressPageProps) {
  void params
  const t = await getTranslations('wordpress')
  const supabase = await createClient()

  const { data } = await supabase
    .from('wordpress_sites')
    .select('id, name, url, last_status, last_checked_at')
    .order('name', { ascending: true })

  const sites = (data ?? []) as WpSiteRow[]
  const total   = sites.length
  const online  = sites.filter((s) => s.last_status === 'online').length
  const offline = sites.filter((s) => s.last_status === 'offline').length

  return (
    <div className="space-y-4 pt-4">

      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-mod-wordpress font-ui mb-0.5">
          {t('moduleLabel')}
        </p>
        <p className="text-lg font-semibold text-text-primary font-ui">{t('title')}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: t('statTotal'),   value: total,   color: 'text-text-primary' },
          { label: t('statOnline'),  value: online,  color: 'text-success' },
          { label: t('statOffline'), value: offline, color: offline > 0 ? 'text-danger' : 'text-text-muted' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-bg-surface border border-border-subtle rounded-2xl p-3 text-center"
          >
            <p className={`text-2xl font-bold font-data ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-medium text-text-muted font-ui mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sites list */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
            {t('sites')}
          </p>
          {/* Add site placeholder button */}
          <button
            type="button"
            disabled
            className="text-[11px] font-semibold font-ui text-mod-wordpress opacity-60
                       border border-mod-wordpress/20 rounded-lg px-2 py-0.5"
          >
            + {t('addSite')}
          </button>
        </div>

        {sites.length === 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 text-center">
            <p className="text-sm text-text-muted font-ui">{t('noSites')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sites.map((site) => (
              <div
                key={site.id}
                className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5
                           flex items-center gap-3"
              >
                <StatusDot status={site.last_status} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary font-ui truncate">{site.name}</p>
                  <p className="text-[11px] text-text-muted font-data truncate">{site.url}</p>
                  {site.last_checked_at && (
                    <p className="text-[10px] text-text-muted font-data mt-0.5">
                      {t('lastChecked')}: {format(new Date(site.last_checked_at), 'HH:mm dd/MM')}
                    </p>
                  )}
                </div>
                <StatusBadge status={site.last_status} />
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
