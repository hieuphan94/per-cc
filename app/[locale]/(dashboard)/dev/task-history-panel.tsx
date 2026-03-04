'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { format, formatDistanceToNow } from 'date-fns'
import { deleteDevTask, deleteAllDoneTasks, restoreTask } from './dev-actions'

interface DoneTask {
  id: string
  title: string
  updated_at: string
  created_at: string
}

interface Props {
  tasks: DoneTask[]
}

export function TaskHistoryPanel({ tasks }: Props) {
  const t = useTranslations('dev')
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleRestore(id: string) {
    startTransition(() => restoreTask(id))
  }

  function handleDelete(id: string) {
    startTransition(() => deleteDevTask(id))
  }

  function handleClearAll() {
    startTransition(() => deleteAllDoneTasks())
  }

  return (
    <section>
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full mb-2 group"
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
          {t('history')}
          <span className="ml-2 text-text-muted font-data normal-case tracking-normal">
            ({tasks.length})
          </span>
        </p>
        <span className={`text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden">
          {tasks.length === 0 ? (
            <p className="text-sm text-text-muted font-ui text-center p-4">{t('noHistory')}</p>
          ) : (
            <>
              {/* Clear all */}
              <div className="flex justify-end px-4 pt-3 pb-1">
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={pending}
                  className="text-[11px] font-semibold font-ui text-danger
                             disabled:opacity-40 transition-opacity"
                >
                  {t('clearAll')}
                </button>
              </div>

              {/* Task rows */}
              <ul className="divide-y divide-border-subtle">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    {/* Done indicator */}
                    <span className="text-success text-xs flex-shrink-0">✓</span>

                    {/* Title + timestamp */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-secondary font-ui line-through truncate">
                        {task.title}
                      </p>
                      <p
                        className="text-[10px] text-text-muted font-data mt-0.5"
                        title={format(new Date(task.updated_at), 'dd/MM/yyyy HH:mm')}
                      >
                        {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Restore + Delete */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRestore(task.id)}
                        disabled={pending}
                        aria-label="Restore task"
                        title="Restore to in progress"
                        className="text-[10px] font-semibold font-ui text-accent
                                   hover:underline disabled:opacity-40 px-1"
                      >
                        {t('restore')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(task.id)}
                        disabled={pending}
                        aria-label="Delete task"
                        className="text-text-muted hover:text-danger transition-colors
                                   disabled:opacity-40 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  )
}
