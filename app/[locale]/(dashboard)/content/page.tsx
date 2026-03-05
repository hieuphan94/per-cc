import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import type { ContentItem } from '@/lib/supabase/types'
import { ContentItemCard } from './content-item-card'
import { AddContentForm } from './add-content-form'

type ContentItemRow = Pick<
  ContentItem,
  'id' | 'title' | 'content_type' | 'status' | 'scheduled_for' | 'ai_outline' | 'raw_idea'
>

interface ContentPageProps {
  params: { locale: string }
}

const STATUS_ORDER = ['idea', 'outlined', 'drafted', 'published'] as const

// Show idea and drafted first (most actionable)
const DISPLAY_SORT = ['idea', 'drafted', 'outlined', 'published'] as const

export default async function ContentPage({ params }: ContentPageProps) {
  void params
  const t = await getTranslations('content')
  const supabase = await createClient()

  const { data } = await supabase
    .from('content_items')
    .select('id, title, content_type, status, scheduled_for, ai_outline, raw_idea')
    .order('updated_at', { ascending: false })

  const items = (data ?? []) as ContentItemRow[]

  const counts = items.reduce<Record<string, number>>(
    (acc, item) => { acc[item.status] = (acc[item.status] ?? 0) + 1; return acc },
    {},
  )

  const sortedItems = [...items].sort((a, b) => {
    const ai = DISPLAY_SORT.indexOf(a.status as typeof DISPLAY_SORT[number])
    const bi = DISPLAY_SORT.indexOf(b.status as typeof DISPLAY_SORT[number])
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  const STATUS_COLOR: Record<string, string> = {
    idea:      'text-accent',
    outlined:  'text-purple-400',
    drafted:   'text-mod-content',
    published: 'text-success',
  }

  return (
    <div className="space-y-4 pt-4">

      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-mod-content font-ui mb-0.5">
          {t('moduleLabel')}
        </p>
        <p className="text-lg font-semibold text-text-primary font-ui">{t('title')}</p>
      </div>

      {/* Pipeline status counts */}
      <div className="grid grid-cols-4 gap-2">
        {STATUS_ORDER.map((status) => (
          <div key={status} className="bg-bg-surface border border-border-subtle rounded-2xl p-3 text-center">
            <p className={`text-xl font-bold font-data ${STATUS_COLOR[status] ?? 'text-text-primary'}`}>
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
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
            {t('pipeline')}
          </p>
          <AddContentForm
            labelAdd={t('addIdea')}
            labelTitle={t('fieldTitle')}
            labelType={t('fieldType')}
            labelIdea={t('fieldIdea')}
            labelSave={t('save')}
            labelCancel={t('cancel')}
            labelOptional={t('optional')}
          />
        </div>

        {sortedItems.length === 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 text-center">
            <p className="text-sm text-text-muted font-ui">{t('noItems')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedItems.map((item) => (
              <ContentItemCard
                key={item.id}
                item={item}
                labelGenerate={t('generateOutline')}
                labelDelete={t('delete')}
                labelAdvance={t('advance')}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
