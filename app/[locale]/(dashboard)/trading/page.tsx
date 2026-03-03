import { getTranslations } from 'next-intl/server'
import { format, startOfMonth } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import type { TradingEntry } from '@/lib/supabase/types'

type TradingEntryRow = Pick<
  TradingEntry,
  'id' | 'entry_date' | 'session' | 'market' | 'direction' | 'pnl' | 'result'
>
type SessionRow = Pick<TradingEntry, 'session'>

interface TradingPageProps {
  params: { locale: string }
}

const TRADING_SESSIONS = ['morning', 'afternoon', 'evening'] as const

const RESULT_STYLES: Record<string, string> = {
  win:       'bg-[#22D47A18] text-success',
  loss:      'bg-[#F5564A18] text-danger',
  breakeven: 'bg-[#F5A62318] text-warning',
}

const DIRECTION_STYLES: Record<string, string> = {
  long:  'text-success',
  short: 'text-danger',
}

export default async function TradingPage({ params }: TradingPageProps) {
  void params
  const t = await getTranslations('trading')
  const supabase = await createClient()

  const today = format(new Date(), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')

  const [sessionResult, monthResult, recentResult] = await Promise.all([
    // Today's sessions
    supabase
      .from('trading_entries')
      .select('session')
      .eq('entry_date', today),
    // This month stats
    supabase
      .from('trading_entries')
      .select('id, pnl, result')
      .gte('entry_date', monthStart),
    // Recent 5 entries
    supabase
      .from('trading_entries')
      .select('id, entry_date, session, market, direction, pnl, result')
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  type MonthStatRow = Pick<TradingEntry, 'id' | 'pnl' | 'result'>

  const sessionRows   = (sessionResult.data  ?? []) as SessionRow[]
  const monthEntries  = (monthResult.data    ?? []) as MonthStatRow[]
  const recentEntries = (recentResult.data   ?? []) as TradingEntryRow[]

  const loggedSessions = new Set(sessionRows.map((e) => e.session))
  const totalMonth = monthEntries.length
  const wins   = monthEntries.filter((e) => e.result === 'win').length
  const losses = monthEntries.filter((e) => e.result === 'loss').length
  const totalPnl = monthEntries.reduce<number>((sum, e) => sum + ((e.pnl as number) ?? 0), 0)

  const pnlColor = totalPnl > 0 ? 'text-success' : totalPnl < 0 ? 'text-danger' : 'text-text-muted'

  return (
    <div className="space-y-4 pt-4">

      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-mod-trading font-ui mb-0.5">
          {t('moduleLabel')}
        </p>
        <p className="text-lg font-semibold text-text-primary font-ui">{t('title')}</p>
      </div>

      {/* Today's sessions */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('todaySessions')}
        </p>
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5
                        flex items-center justify-around">
          {TRADING_SESSIONS.map((session) => {
            const logged = loggedSessions.has(session)
            return (
              <div key={session} className="flex flex-col items-center gap-1.5">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                  logged ? 'bg-[#F5A62318] text-mod-trading' : 'bg-bg-surface-3 text-text-muted'
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

      {/* Monthly stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold font-data text-text-primary">{totalMonth}</p>
          <p className="text-[10px] font-medium text-text-muted font-ui mt-0.5">{t('totalEntries')}</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-3 text-center">
          <p className={`text-2xl font-bold font-data ${pnlColor}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
          </p>
          <p className="text-[10px] font-medium text-text-muted font-ui mt-0.5">{t('pnl')}</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold font-data text-success">{wins}</p>
          <p className="text-[10px] font-medium text-text-muted font-ui mt-0.5">{t('wins')}</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold font-data text-danger">{losses}</p>
          <p className="text-[10px] font-medium text-text-muted font-ui mt-0.5">{t('losses')}</p>
        </div>
      </div>

      {/* Recent entries */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('recentEntries')}
        </p>

        {recentEntries.length === 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 text-center">
            <p className="text-sm text-text-muted font-ui">{t('noEntries')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5
                           flex items-center gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[11px] font-medium text-text-muted font-data">
                      {format(new Date(entry.entry_date), 'dd/MM')}
                    </p>
                    {entry.market && (
                      <p className="text-xs font-semibold text-text-primary font-data uppercase">
                        {entry.market}
                      </p>
                    )}
                    {entry.direction && (
                      <span className={`text-[10px] font-bold font-ui uppercase ${
                        DIRECTION_STYLES[entry.direction] ?? 'text-text-muted'
                      }`}>
                        {entry.direction}
                      </span>
                    )}
                  </div>
                  {entry.session && (
                    <p className="text-[10px] text-text-muted font-ui capitalize">{entry.session}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.pnl !== null && (
                    <span className={`text-sm font-bold font-data ${
                      entry.pnl > 0 ? 'text-success' : entry.pnl < 0 ? 'text-danger' : 'text-text-muted'
                    }`}>
                      {entry.pnl >= 0 ? '+' : ''}{entry.pnl.toFixed(2)}
                    </span>
                  )}
                  {entry.result && (
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui ${
                      RESULT_STYLES[entry.result] ?? 'bg-bg-surface-3 text-text-muted'
                    }`}>
                      {entry.result}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
