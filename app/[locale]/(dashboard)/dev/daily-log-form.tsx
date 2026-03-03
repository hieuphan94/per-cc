'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { saveDailyLog } from './dev-actions'

interface Props {
  date: string
  initial: { done: string[] | null; blocked: string[] | null; next: string[] | null } | null
}

const LOG_FIELDS = [
  { name: 'done',    colorClass: 'text-success', icon: '✓' },
  { name: 'blocked', colorClass: 'text-danger',  icon: '✗' },
  { name: 'next',    colorClass: 'text-accent',  icon: '→' },
] as const

// Read-only view of a log section
function LogSection({
  label, items, color, icon,
}: { label: string; items: string[] | null; color: string; icon: string }) {
  if (!items?.length) return null
  return (
    <div>
      <p className={`text-[10px] font-semibold uppercase font-ui mb-1 ${color}`}>{label}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary font-ui">
            <span className={`${color} mt-0.5 flex-shrink-0`}>{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DailyLogForm({ date, initial }: Props) {
  const t = useTranslations('dev')
  // Start in edit mode if no log exists yet
  const [editing, setEditing] = useState(!initial)

  async function handleSubmit(formData: FormData) {
    await saveDailyLog(formData)
    setEditing(false)
  }

  // Read-only display when log is saved
  if (!editing && initial) {
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-3">
        <LogSection label={t('logDone')}    items={initial.done}    color="text-success" icon="✓" />
        <LogSection label={t('logBlocked')} items={initial.blocked} color="text-danger"  icon="✗" />
        <LogSection label={t('logNext')}    items={initial.next}    color="text-accent"  icon="→" />
        {!initial.done?.length && !initial.blocked?.length && !initial.next?.length && (
          <p className="text-sm text-text-muted font-ui text-center">{t('noLog')}</p>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[11px] font-semibold font-ui text-accent"
        >
          {t('editLog')}
        </button>
      </div>
    )
  }

  // Edit form — each textarea is one item per line
  return (
    <form
      action={handleSubmit}
      className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-3"
    >
      <input type="hidden" name="date" value={date} />

      {LOG_FIELDS.map((field) => (
        <div key={field.name}>
          <p className={`text-[10px] font-semibold uppercase font-ui mb-1 ${field.colorClass}`}>
            {t(`log${field.name.charAt(0).toUpperCase() + field.name.slice(1)}` as 'logDone' | 'logBlocked' | 'logNext')}
          </p>
          <textarea
            name={field.name}
            rows={2}
            defaultValue={initial?.[field.name]?.join('\n') ?? ''}
            placeholder="One item per line"
            className="w-full bg-bg-surface-2 border border-border-muted rounded-xl px-3 py-2
                       text-sm text-text-primary placeholder-text-muted font-ui resize-none
                       focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
          />
        </div>
      ))}

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-accent text-bg-base text-sm font-semibold rounded-xl font-ui
                     active:scale-95 transition-transform"
        >
          {t('saveLog')}
        </button>
        {initial && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-4 py-2 bg-bg-surface-3 text-text-muted text-sm rounded-xl font-ui"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  )
}
