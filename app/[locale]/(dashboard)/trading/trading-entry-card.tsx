'use client'

// Trading entry card — shows trade details with delete and expandable notes

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { deleteEntry } from './trading-actions'
import type { TradingEntry } from '@/lib/supabase/types'

type EntryRow = Pick<
  TradingEntry,
  'id' | 'entry_date' | 'session' | 'market' | 'direction' | 'pnl' | 'result' | 'notes'
>

const RESULT_STYLES: Record<string, string> = {
  win:       'bg-[#22D47A18] text-success',
  loss:      'bg-[#F5564A18] text-danger',
  breakeven: 'bg-[#F5A62318] text-warning',
}

const DIRECTION_STYLES: Record<string, string> = {
  long:  'text-success',
  short: 'text-danger',
}

interface TradingEntryCardProps {
  entry: EntryRow
  labelDelete: string
}

export function TradingEntryCard({ entry, labelDelete }: TradingEntryCardProps) {
  const [expanded, setExpanded]   = useState(false)
  const [isPending, startDelete]  = useTransition()

  function handleDelete() {
    if (!confirm(`Delete this trade?`)) return
    startDelete(async () => { await deleteEntry(entry.id) })
  }

  const pnlColor =
    entry.pnl === null ? 'text-text-muted' :
    entry.pnl > 0      ? 'text-success'    :
    entry.pnl < 0      ? 'text-danger'     : 'text-text-muted'

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5 space-y-2">

      {/* Main row */}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
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
            {entry.session && (
              <span className="text-[10px] text-text-muted font-ui capitalize">{entry.session}</span>
            )}
          </div>
        </div>

        {/* PnL + result badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {entry.pnl !== null && (
            <span className={`text-sm font-bold font-data ${pnlColor}`}>
              {entry.pnl >= 0 ? '+' : ''}{Number(entry.pnl).toFixed(2)}
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

      {/* Notes (expandable) */}
      {entry.notes && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="text-[10px] text-mod-trading font-ui"
          >
            {expanded ? '▲ hide notes' : '▼ notes'}
          </button>
          {expanded && (
            <p className="mt-1 text-[11px] text-text-muted font-ui leading-relaxed">
              {entry.notes}
            </p>
          )}
        </div>
      )}

      {/* Delete */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-[10px] font-semibold font-ui text-danger/70
                     border border-danger/15 rounded-lg px-2.5 py-0.5 disabled:opacity-50"
        >
          {isPending ? '…' : labelDelete}
        </button>
      </div>

    </div>
  )
}
