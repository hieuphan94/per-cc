import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import type { WordPressSite } from '@/lib/supabase/types'
import { SiteCard } from './site-card'
import { AddSiteForm } from './add-site-form'
import { CheckAllButton } from './check-all-button'

type WpSiteRow = Pick<
  WordPressSite,
  'id' | 'name' | 'url' | 'last_status' | 'last_checked_at' | 'domain_expiry_at'
>

interface WordPressPageProps {
  params: { locale: string }
}

export default async function WordPressPage({ params }: WordPressPageProps) {
  void params
  const t = await getTranslations('wordpress')
  const supabase = await createClient()

  const { data } = await supabase
    .from('wordpress_sites')
    .select('id, name, url, last_status, last_checked_at, domain_expiry_at')
    .order('name', { ascending: true })

  const sites   = (data ?? []) as WpSiteRow[]
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
          <div className="flex items-center gap-2">
            {sites.length > 0 && (
              <CheckAllButton label={t('checkAll')} />
            )}
            <AddSiteForm
              labelAdd={t('addSite')}
              labelName={t('fieldName')}
              labelUrl={t('fieldUrl')}
              labelDomainExpiry={t('domainExpiry')}
              labelWpUser={t('fieldWpUser')}
              labelWpPassword={t('fieldWpPassword')}
              labelSave={t('save')}
              labelCancel={t('cancel')}
              labelOptional={t('optional')}
            />
          </div>
        </div>

        {sites.length === 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 text-center">
            <p className="text-sm text-text-muted font-ui">{t('noSites')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                labelCheck={t('checkSite')}
                labelDelete={t('delete')}
                labelLastChecked={t('lastChecked')}
                labelDomainExpiry={t('domainExpiry')}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
