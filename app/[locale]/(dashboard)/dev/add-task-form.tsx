'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { addDevTask } from './dev-actions'

export function AddTaskForm() {
  const t = useTranslations('dev')
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    await addDevTask(formData)
    formRef.current?.reset()
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] font-semibold font-ui text-mod-dev opacity-80
                   border border-mod-dev/20 rounded-lg px-2 py-0.5"
      >
        + {t('addTask')}
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-2 bg-bg-surface border border-border-subtle rounded-2xl p-3"
    >
      <input
        name="title"
        required
        autoFocus
        placeholder={t('addTaskPlaceholder')}
        className="w-full bg-bg-surface-2 border border-border-muted rounded-xl px-3 py-2
                   text-sm text-text-primary placeholder-text-muted font-ui
                   focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          name="project"
          placeholder="Project (optional)"
          className="bg-bg-surface-2 border border-border-muted rounded-xl px-3 py-2
                     text-sm text-text-primary placeholder-text-muted font-ui
                     focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
        />
        <input
          type="date"
          name="due_date"
          className="bg-bg-surface-2 border border-border-muted rounded-xl px-3 py-2
                     text-sm text-text-primary font-ui focus:outline-none focus:border-accent
                     focus:ring-1 focus:ring-accent/30 [color-scheme:dark]"
        />
      </div>
      <div className="flex items-center gap-2">
        <select
          name="priority"
          className="flex-1 bg-bg-surface-2 border border-border-muted rounded-xl px-3 py-2
                     text-sm text-text-primary font-ui focus:outline-none focus:border-accent"
        >
          <option value="">— priority —</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          type="submit"
          className="px-3 py-2 bg-accent text-bg-base text-sm font-semibold rounded-xl font-ui
                     active:scale-95 transition-transform"
        >
          {t('addTask')}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-2 bg-bg-surface-3 text-text-muted text-sm rounded-xl font-ui"
        >
          ✕
        </button>
      </div>
    </form>
  )
}
