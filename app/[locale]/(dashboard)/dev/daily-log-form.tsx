'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { saveDailyLog } from './dev-actions'
import { RichTextEditor } from './rich-text-editor'

interface TaskHint {
  title: string
  status: string
}

interface Props {
  date: string
  initial: { done: string | null; blocked: string | null; next: string | null } | null
  tasks?: TaskHint[]
}

const LOG_FIELDS = [
  { name: 'done' as const,    colorClass: 'text-success', icon: '✓' },
  { name: 'blocked' as const, colorClass: 'text-danger',  icon: '✗' },
  { name: 'next' as const,    colorClass: 'text-accent',  icon: '→' },
]

// Convert task titles to a simple HTML bullet list
function taskListHtml(titles: string[]): string {
  if (!titles.length) return ''
  return '<ul>' + titles.map((t) => `<li>${t}</li>`).join('') + '</ul>'
}

// Read-only section — renders stored HTML safely
function LogSection({
  label, html, color, icon,
}: { label: string; html: string | null; color: string; icon: string }) {
  if (!html || html === '<p></p>') return null
  return (
    <div>
      <p className={`text-[10px] font-semibold uppercase font-ui mb-1 ${color}`}>
        {icon} {label}
      </p>
      <div
        className="text-sm text-text-secondary font-ui prose-dark"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function DailyLogForm({ date, initial, tasks = [] }: Props) {
  const t = useTranslations('dev')
  const [saved, setSaved] = useState(initial)
  const [editing, setEditing] = useState(!initial)

  // When no saved log, pre-populate editors from task statuses
  const defaults = saved ?? {
    done:    taskListHtml(tasks.filter((t) => t.status === 'done').map((t) => t.title)),
    blocked: taskListHtml(tasks.filter((t) => t.status === 'blocked').map((t) => t.title)),
    next:    taskListHtml(tasks.filter((t) => t.status === 'in_progress' || t.status === 'todo').map((t) => t.title)),
  }

  async function handleSubmit(formData: FormData) {
    await saveDailyLog(formData)
    setSaved({
      done:    (formData.get('done')    as string | null) || null,
      blocked: (formData.get('blocked') as string | null) || null,
      next:    (formData.get('next')    as string | null) || null,
    })
    setEditing(false)
  }

  // Read-only display
  if (!editing && saved) {
    const isEmpty = !saved.done && !saved.blocked && !saved.next
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-3">
        {isEmpty ? (
          <p className="text-sm text-text-muted font-ui text-center">{t('noLog')}</p>
        ) : (
          LOG_FIELDS.map((f) => (
            <LogSection
              key={f.name}
              label={t(`log${f.name.charAt(0).toUpperCase() + f.name.slice(1)}` as 'logDone' | 'logBlocked' | 'logNext')}
              html={saved[f.name]}
              color={f.colorClass}
              icon={f.icon}
            />
          ))
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

  // Edit form — one rich text editor per section
  return (
    <form
      action={handleSubmit}
      className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-3"
    >
      <input type="hidden" name="date" value={date} />

      {LOG_FIELDS.map((field) => (
        <div key={field.name}>
          <p className={`text-[10px] font-semibold uppercase font-ui mb-1 ${field.colorClass}`}>
            {field.icon} {t(`log${field.name.charAt(0).toUpperCase() + field.name.slice(1)}` as 'logDone' | 'logBlocked' | 'logNext')}
          </p>
          <RichTextEditor
            name={field.name}
            defaultValue={defaults[field.name] ?? ''}
            placeholder={t('addTask')}
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
        {saved && (
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
