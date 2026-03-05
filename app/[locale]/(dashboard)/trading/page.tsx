import { getTranslations } from 'next-intl/server'
import { format, startOfMonth } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import type { TradingEntry } from '@/lib/supabase/types'
import { TradingEntryCard } from './trading-entry-card'
import { AddTradeForm } from './add-trade-form'

type SessionRow  = Pick<TradingEntry, 'session'>
type MonthRow    = Pick<TradingEntry, 'id' | 'pnl' | 'result'>
type EntryRow    = Pick<TradingEntry, 'id' | 'entry_date' | 'session' | 'market' | 'direction' | 'pnl' | 'result' | 'notes'>

const TRADING_SESSIONS = ['morning', 'afternoon', 'evening'] as const

interface TradingPageProps {
  params: { locale: string }
}

export default async function TradingPage({ params }: TradingPageProps) {
  void params
  const t = await getTranslations('trading')
  const supabase = await createClient()

  const today      = format(new Date(), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')

  const [sessionResult, monthResult, recentResult] = await Promise.all([
    supabase.from('trading_entries').select('session').eq('entry_date', today),
    supabase.from('trading_entries').select('id, pnl, result').gte('entry_date', monthStart),
    supabase
      .from('trading_entries')
      .select('id, entry_date, session, market, direction, pnl, result, notes')
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const sessionRows   = (sessionResult.data ?? []) as SessionRow[]
  const monthEntries  = (monthResult.data   ?? []) as MonthRow[]
  const recentEntries = (recentResult.data  ?? []) as EntryRow[]

  const loggedSessions = new Set(sessionRows.map((e) => e.session))
  const totalMonth = monthEntries.length
  const wins       = monthEntries.filter((e) => e.result === 'win').length
  const losses     = monthEntries.filter((e) => e.result === 'loss').length
  const winRate    = totalMonth > 0 ? Math.round((wins / totalMonth) * 100) : 0
  const totalPnl   = monthEntries.reduce<number>((sum, e) => sum + (Number(e.pnl) || 0), 0)
  const pnlColor   = totalPnl > 0 ? 'text-success' : totalPnl < 0 ? 'text-danger' : 'text-text-muted'

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
        {[
          { label: t('totalEntries'), value: String(totalMonth),                                  color: 'text-text-primary' },
          { label: t('pnl'),          value: `${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}`, color: pnlColor },
          { label: t('wins'),         value: String(wins),                                         color: 'text-success' },
          { label: t('losses'),       value: String(losses),                                       color: losses > 0 ? 'text-danger' : 'text-text-muted' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-bg-surface border border-border-subtle rounded-2xl p-3 text-center">
            <p className={`text-2xl font-bold font-data ${color}`}>{value}</p>
            <p className="text-[10px] font-medium text-text-muted font-ui mt-0.5">{label}</p>
          </div>
        ))}
        {/* Win rate — full width */}
        <div className="col-span-2 bg-bg-surface border border-border-subtle rounded-2xl p-3 text-center">
          <p className={`text-2xl font-bold font-data ${winRate >= 50 ? 'text-success' : 'text-text-muted'}`}>
            {winRate}%
          </p>
          <p className="text-[10px] font-medium text-text-muted font-ui mt-0.5">{t('winRate')}</p>
        </div>
      </div>

      {/* Recent entries */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
            {t('recentEntries')}
          </p>
          <AddTradeForm
            labelAdd={t('addEntry')}
            labelDate={t('fieldDate')}
            labelSession={t('session')}
            labelMarket={t('fieldMarket')}
            labelDirection={t('fieldDirection')}
            labelEntryPrice={t('fieldEntryPrice')}
            labelExitPrice={t('fieldExitPrice')}
            labelLotSize={t('fieldLotSize')}
            labelPnl={t('pnl')}
            labelResult={t('fieldResult')}
            labelNotes={t('fieldNotes')}
            labelSave={t('save')}
            labelCancel={t('cancel')}
            labelOptional={t('optional')}
          />
        </div>

        {recentEntries.length === 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 text-center">
            <p className="text-sm text-text-muted font-ui">{t('noEntries')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentEntries.map((entry) => (
              <TradingEntryCard
                key={entry.id}
                entry={entry}
                labelDelete={t('delete')}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
