import { getTranslations } from 'next-intl/server'
import { format, subDays, startOfDay } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import type { LearningEntry } from '@/lib/supabase/types'
import { AddLearningForm } from './add-learning-form'
import { LearningEntryCard } from './learning-entry-card'

type LearningEntryRow = Pick<
  LearningEntry,
  'id' | 'entry_date' | 'entry_type' | 'title' | 'source' | 'notes'
>

interface LearningPageProps {
  params: { locale: string }
}

const ENTRY_TYPE_ICONS: Record<string, string> = {
  reading: '📖', ai_tool: '🤖', english: '🔤', other: '💡',
}

const ENTRY_TYPE_STYLES: Record<string, string> = {
  reading: 'bg-[#60A5FA18] text-mod-learning',
  ai_tool: 'bg-[#A78BFA18] text-purple-400',
  english: 'bg-[#22D47A18] text-success',
  other:   'bg-[#3DD6F518] text-accent',
}

const ENTRY_TYPE_LABELS: Record<string, string> = {
  reading: 'Reading', ai_tool: 'AI Tool', english: 'English', other: 'Other',
}

const TYPE_KEYS = ['reading', 'ai_tool', 'english', 'other'] as const

export default async function LearningPage({ params }: LearningPageProps) {
  void params
  const t = await getTranslations('learning')
  const supabase = await createClient()

  const today     = format(new Date(), 'yyyy-MM-dd')
  const weekStart = format(subDays(startOfDay(new Date()), 6), 'yyyy-MM-dd')

  const [todayResult, weekResult] = await Promise.all([
    supabase
      .from('learning_entries')
      .select('id, entry_date, entry_type, title, source, notes')
      .eq('entry_date', today)
      .order('created_at', { ascending: false }),
    supabase
      .from('learning_entries')
      .select('id, entry_date, entry_type, title, source, notes')
      .gte('entry_date', weekStart)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  const todayEntries = (todayResult.data ?? []) as LearningEntryRow[]
  const weekEntries  = (weekResult.data  ?? []) as LearningEntryRow[]

  const typeCounts = weekEntries.reduce<Record<string, number>>(
    (acc, e) => { acc[e.entry_type] = (acc[e.entry_type] ?? 0) + 1; return acc },
    {},
  )

  return (
    <div className="space-y-4 pt-4">

      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-mod-learning font-ui mb-0.5">
          {t('moduleLabel')}
        </p>
        <p className="text-lg font-semibold text-text-primary font-ui">{t('title')}</p>
      </div>

      {/* Today */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
            {t('todayEntries')}
          </p>
          <AddLearningForm
            labelAdd={t('addEntry')}
            labelTitle={t('fieldTitle')}
            labelType={t('fieldType')}
            labelSource={t('fieldSource')}
            labelNotes={t('fieldNotes')}
            labelSave={t('save')}
            labelCancel={t('cancel')}
            labelOptional={t('optional')}
          />
        </div>

        {todayEntries.length === 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 text-center">
            <p className="text-sm text-text-muted font-ui">{t('nothingToday')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayEntries.map((entry) => (
              <LearningEntryCard
                key={entry.id}
                entry={entry}
                labelDelete={t('delete')}
                typeIcons={ENTRY_TYPE_ICONS}
                typeStyles={ENTRY_TYPE_STYLES}
                typeLabels={ENTRY_TYPE_LABELS}
              />
            ))}
          </div>
        )}
      </section>

      {/* Weekly breakdown */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('weekBreakdown')}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {TYPE_KEYS.map((type) => (
            <div key={type} className="bg-bg-surface border border-border-subtle rounded-2xl p-3 text-center">
              <p className="text-lg mb-0.5">{ENTRY_TYPE_ICONS[type]}</p>
              <p className={`text-xl font-bold font-data ${ENTRY_TYPE_STYLES[type]?.split(' ')[1] ?? 'text-text-primary'}`}>
                {typeCounts[type] ?? 0}
              </p>
              <p className="text-[9px] font-medium text-text-muted font-ui mt-0.5">
                {ENTRY_TYPE_LABELS[type]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent 7 days */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('recentEntries')}
        </p>
        {weekEntries.length === 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 text-center">
            <p className="text-sm text-text-muted font-ui">{t('noEntries')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {weekEntries.map((entry) => (
              <LearningEntryCard
                key={entry.id}
                entry={entry}
                labelDelete={t('delete')}
                showDate
                typeIcons={ENTRY_TYPE_ICONS}
                typeStyles={ENTRY_TYPE_STYLES}
                typeLabels={ENTRY_TYPE_LABELS}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
