'use client'

import { useTransition } from 'react'
import { cycleTaskStatus, deleteDevTask } from './dev-actions'
import type { DevTask } from '@/lib/supabase/types'

type TaskRow = Pick<DevTask, 'id' | 'title' | 'status' | 'priority'>

const PRIORITY_STYLES: Record<string, string> = {
  high:   'bg-[#F5564A18] text-danger',
  medium: 'bg-[#F5A62318] text-warning',
  low:    'bg-[#22D47A18] text-success',
}

const STATUS_STYLES: Record<string, string> = {
  in_progress: 'bg-[#A78BFA18] text-purple',
  todo:        'bg-[#3DD6F518] text-accent',
  blocked:     'bg-[#F5564A18] text-danger',
  done:        'bg-[#22D47A18] text-success',
}

// Tap the status badge to advance: todo → in_progress → done → todo
// Hover over card to reveal × delete button (DB only, Sheet untouched)
export function TaskCard({ task }: { task: TaskRow }) {
  const [pending, startTransition] = useTransition()

  function handleStatusClick() {
    startTransition(async () => { await cycleTaskStatus(task.id, task.status) })
  }

  function handleDelete() {
    startTransition(async () => { await deleteDevTask(task.id) })
  }

  return (
    <div className="group bg-bg-surface border border-border-subtle rounded-2xl p-3.5 flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium font-ui ${
          task.status === 'done' ? 'text-text-muted line-through' : 'text-text-primary'
        }`}>
          {task.title}
        </p>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Delete button — visible on hover (desktop) or always on touch devices */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          title="Delete task (DB only)"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150
                     w-5 h-5 flex items-center justify-center rounded-md
                     text-text-muted hover:text-danger hover:bg-[#F5564A18]
                     text-xs font-bold disabled:opacity-30"
        >
          ✕
        </button>
        {task.priority && (
          <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui
                           ${PRIORITY_STYLES[task.priority] ?? 'bg-bg-surface-3 text-text-muted'}`}>
            {task.priority}
          </span>
        )}
        {/* Tappable status badge — cycles through states */}
        <button
          type="button"
          onClick={handleStatusClick}
          disabled={pending}
          title="Tap to advance status"
          className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui
                      ${STATUS_STYLES[task.status] ?? 'bg-bg-surface-3 text-text-muted'}
                      ${pending ? 'opacity-50' : 'active:scale-95 transition-transform cursor-pointer'}`}
        >
          {task.status.replace('_', ' ')}
        </button>
      </div>
    </div>
  )
}
