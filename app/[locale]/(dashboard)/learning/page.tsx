import { getTranslations } from 'next-intl/server'
import { format, subDays, startOfDay } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import type { LearningEntry } from '@/lib/supabase/types'

type LearningEntryRow = Pick<
  LearningEntry,
  'id' | 'entry_date' | 'entry_type' | 'title' | 'source'
>

interface LearningPageProps {
  params: { locale: string }
}

const ENTRY_TYPE_ICONS: Record<string, string> = {
  reading: '📖',
  ai_tool: '🤖',
  english: '🔤',
  other:   '💡',
}

const ENTRY_TYPE_STYLES: Record<string, string> = {
  reading: 'bg-[#60A5FA18] text-mod-learning',
  ai_tool: 'bg-[#A78BFA18] text-purple',
  english: 'bg-[#22D47A18] text-success',
  other:   'bg-[#3DD6F518] text-accent',
}

const ENTRY_TYPE_LABELS: Record<string, string> = {
  reading: 'Reading',
  ai_tool: 'AI Tool',
  english: 'English',
  other:   'Other',
}

export default async function LearningPage({ params }: LearningPageProps) {
  void params
  const t = await getTranslations('learning')
  const supabase = await createClient()

  const today     = format(new Date(), 'yyyy-MM-dd')
  const weekStart = format(subDays(startOfDay(new Date()), 6), 'yyyy-MM-dd')

  const [todayResult, weekResult] = await Promise.all([
    // Today's entries
    supabase
      .from('learning_entries')
      .select('id, entry_date, entry_type, title, source')
      .eq('entry_date', today)
      .order('created_at', { ascending: false }),
    // Last 7 days entries
    supabase
      .from('learning_entries')
      .select('id, entry_date, entry_type, title, source')
      .gte('entry_date', weekStart)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  const todayEntries = (todayResult.data ?? []) as LearningEntryRow[]
  const weekEntries  = (weekResult.data  ?? []) as LearningEntryRow[]

  // Count by type this week
  const typeCounts = weekEntries.reduce<Record<string, number>>(
    (acc, entry) => { acc[entry.entry_type] = (acc[entry.entry_type] ?? 0) + 1; return acc },
    {}
  )

  const typeKeys = ['reading', 'ai_tool', 'english', 'other'] as const

  return (
    <div className="space-y-4 pt-4">

      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-mod-learning font-ui mb-0.5">
          {t('moduleLabel')}
        </p>
        <p className="text-lg font-semibold text-text-primary font-ui">{t('title')}</p>
      </div>

      {/* Today's entries */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('todayEntries')}
        </p>

        {todayEntries.length === 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 text-center">
            <p className="text-sm text-text-muted font-ui">{t('nothingToday')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5
                           flex items-start gap-3"
              >
                <span className="text-base flex-shrink-0 mt-0.5">
                  {ENTRY_TYPE_ICONS[entry.entry_type] ?? '💡'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary font-ui">{entry.title}</p>
                  {entry.source && (
                    <p className="text-[11px] text-text-muted font-data truncate mt-0.5">{entry.source}</p>
                  )}
                </div>
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui flex-shrink-0 ${
                  ENTRY_TYPE_STYLES[entry.entry_type] ?? 'bg-bg-surface-3 text-text-muted'
                }`}>
                  {ENTRY_TYPE_LABELS[entry.entry_type] ?? entry.entry_type}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Weekly type breakdown */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('weekBreakdown')}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {typeKeys.map((type) => (
            <div
              key={type}
              className="bg-bg-surface border border-border-subtle rounded-2xl p-3 text-center"
            >
              <p className="text-lg mb-0.5">{ENTRY_TYPE_ICONS[type]}</p>
              <p className={`text-xl font-bold font-data ${
                ENTRY_TYPE_STYLES[type]?.split(' ')[1] ?? 'text-text-primary'
              }`}>
                {typeCounts[type] ?? 0}
              </p>
              <p className="text-[9px] font-medium text-text-muted font-ui mt-0.5">
                {ENTRY_TYPE_LABELS[type]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent entries (last 7 days) */}
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
              <div
                key={entry.id}
                className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5
                           flex items-center gap-3"
              >
                <span className="text-base flex-shrink-0">
                  {ENTRY_TYPE_ICONS[entry.entry_type] ?? '💡'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary font-ui truncate">{entry.title}</p>
                </div>
                <p className="text-[11px] text-text-muted font-data flex-shrink-0">
                  {format(new Date(entry.entry_date), 'dd/MM')}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
