import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import type { ContentItem } from '@/lib/supabase/types'

type ContentItemRow = Pick<
  ContentItem,
  'id' | 'title' | 'content_type' | 'status' | 'scheduled_for'
>

interface ContentPageProps {
  params: { locale: string }
}

const STATUS_ORDER = ['idea', 'outlined', 'drafted', 'published'] as const

const STATUS_STYLES: Record<string, string> = {
  idea:      'bg-[#3DD6F518] text-accent',
  outlined:  'bg-[#A78BFA18] text-purple',
  drafted:   'bg-[#F472B618] text-mod-content',
  published: 'bg-[#22D47A18] text-success',
}

const TYPE_STYLES: Record<string, string> = {
  fb_post:      'bg-[#3DD6F518] text-accent',
  blog:         'bg-[#A78BFA18] text-purple',
  video_script: 'bg-[#F5A62318] text-warning',
}

const TYPE_LABELS: Record<string, string> = {
  fb_post:      'FB Post',
  blog:         'Blog',
  video_script: 'Video',
}

// Show idea and drafted items first (most actionable)
const DISPLAY_STATUSES = ['idea', 'drafted', 'outlined', 'published'] as const

export default async function ContentPage({ params }: ContentPageProps) {
  void params
  const t = await getTranslations('content')
  const supabase = await createClient()

  const { data } = await supabase
    .from('content_items')
    .select('id, title, content_type, status, scheduled_for')
    .order('status', { ascending: true })
    .order('updated_at', { ascending: false })

  const items = (data ?? []) as ContentItemRow[]

  // Count by status
  const counts = items.reduce<Record<string, number>>(
    (acc, item) => { acc[item.status] = (acc[item.status] ?? 0) + 1; return acc },
    {}
  )

  // Sort items so idea and drafted come first
  const sortedItems = [...items].sort((a, b) => {
    const aIdx = DISPLAY_STATUSES.indexOf(a.status as typeof DISPLAY_STATUSES[number])
    const bIdx = DISPLAY_STATUSES.indexOf(b.status as typeof DISPLAY_STATUSES[number])
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx)
  })

  return (
    <div className="space-y-4 pt-4">

      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-mod-content font-ui mb-0.5">
          {t('moduleLabel')}
        </p>
        <p className="text-lg font-semibold text-text-primary font-ui">{t('title')}</p>
      </div>

      {/* Pipeline status row */}
      <div className="grid grid-cols-4 gap-2">
        {STATUS_ORDER.map((status) => (
          <div
            key={status}
            className="bg-bg-surface border border-border-subtle rounded-2xl p-3 text-center"
          >
            <p className={`text-xl font-bold font-data ${
              STATUS_STYLES[status]?.split(' ')[1] ?? 'text-text-primary'
            }`}>
              {counts[status] ?? 0}
            </p>
            <p className="text-[9px] font-medium text-text-muted font-ui mt-0.5 capitalize">
              {status}
            </p>
          </div>
        ))}
      </div>

      {/* Items list */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('pipeline')}
        </p>

        {sortedItems.length === 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 text-center">
            <p className="text-sm text-text-muted font-ui">{t('noItems')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedItems.map((item) => (
              <div
                key={item.id}
                className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5
                           flex items-start gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary font-ui leading-snug">
                    {item.title}
                  </p>
                  {item.scheduled_for && (
                    <p className="text-[10px] text-text-muted font-data mt-0.5">
                      {t('scheduledFor')}: {format(new Date(item.scheduled_for), 'dd/MM/yyyy')}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui ${
                    TYPE_STYLES[item.content_type] ?? 'bg-bg-surface-3 text-text-muted'
                  }`}>
                    {TYPE_LABELS[item.content_type] ?? item.content_type}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui ${
                    STATUS_STYLES[item.status] ?? 'bg-bg-surface-3 text-text-muted'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
