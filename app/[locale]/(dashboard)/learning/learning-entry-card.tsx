'use client'

// Learning entry card — shows icon, title, source/notes, optional date, delete button

import { useTransition } from 'react'
import { format } from 'date-fns'
import { deleteLearningEntry } from './learning-actions'
import type { LearningEntry } from '@/lib/supabase/types'

type EntryRow = Pick<LearningEntry, 'id' | 'entry_date' | 'entry_type' | 'title' | 'source' | 'notes'>

interface LearningEntryCardProps {
  entry: EntryRow
  labelDelete: string
  showDate?: boolean
  typeIcons: Record<string, string>
  typeStyles: Record<string, string>
  typeLabels: Record<string, string>
}

export function LearningEntryCard({
  entry, labelDelete, showDate = false, typeIcons, typeStyles, typeLabels,
}: LearningEntryCardProps) {
  const [isPending, startDelete] = useTransition()

  function handleDelete() {
    if (!confirm(`Delete "${entry.title}"?`)) return
    startDelete(async () => { await deleteLearningEntry(entry.id) })
  }

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5 flex items-start gap-3">
      <span className="text-base flex-shrink-0 mt-0.5">
        {typeIcons[entry.entry_type] ?? '💡'}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary font-ui leading-snug">{entry.title}</p>
        {entry.source && (
          <p className="text-[11px] text-text-muted font-data truncate mt-0.5">{entry.source}</p>
        )}
        {entry.notes && (
          <p className="text-[10px] text-text-muted font-ui mt-0.5 leading-relaxed line-clamp-2">
            {entry.notes}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui ${
          typeStyles[entry.entry_type] ?? 'bg-bg-surface-3 text-text-muted'
        }`}>
          {typeLabels[entry.entry_type] ?? entry.entry_type}
        </span>
        {showDate && (
          <p className="text-[10px] text-text-muted font-data">
            {format(new Date(entry.entry_date), 'dd/MM')}
          </p>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-[10px] font-semibold font-ui text-danger/60
                     border border-danger/15 rounded-lg px-2 py-0.5 disabled:opacity-50"
        >
          {isPending ? '…' : labelDelete}
        </button>
      </div>
    </div>
  )
}
