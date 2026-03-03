'use client'

import { useState } from 'react'
import { TaskCard } from './task-card'
import type { DevTask } from '@/lib/supabase/types'

type TaskRow = Pick<DevTask, 'id' | 'title' | 'status' | 'priority'>

interface Props {
  tasks: TaskRow[]
  noTasksLabel: string
}

const STATUS_ORDER = ['in_progress', 'todo', 'blocked', 'done'] as const
type StatusFilter = typeof STATUS_ORDER[number] | null

const STATUS_COLOR: Record<string, string> = {
  in_progress: 'text-purple',
  todo:        'text-accent',
  blocked:     'text-danger',
  done:        'text-success',
}

const STATUS_RING: Record<string, string> = {
  in_progress: 'ring-purple/40',
  todo:        'ring-accent/40',
  blocked:     'ring-danger/40',
  done:        'ring-success/40',
}

export function TaskListWithFilter({ tasks, noTasksLabel }: Props) {
  const [filter, setFilter] = useState<StatusFilter>(null)

  const counts = tasks.reduce<Record<string, number>>(
    (acc, t) => { acc[t.status] = (acc[t.status] ?? 0) + 1; return acc },
    {}
  )

  // Show filtered tasks; if no filter active, show all except done
  const visible = filter
    ? tasks.filter((t) => t.status === filter)
    : tasks.filter((t) => t.status !== 'done')

  function toggleFilter(status: StatusFilter) {
    setFilter((prev) => (prev === status ? null : status))
  }

  return (
    <>
      {/* Clickable status summary row */}
      <div className="grid grid-cols-4 gap-2">
        {STATUS_ORDER.map((status) => {
          const active = filter === status
          return (
            <button
              key={status}
              type="button"
              onClick={() => toggleFilter(status)}
              className={`bg-bg-surface border rounded-2xl p-3 text-center
                          active:scale-95 transition-all duration-150
                          ${active
                            ? `border-current ${STATUS_COLOR[status]} ring-2 ${STATUS_RING[status]}`
                            : 'border-border-subtle'}`}
            >
              <p className={`text-xl font-bold font-data ${STATUS_COLOR[status]}`}>
                {counts[status] ?? 0}
              </p>
              <p className="text-[9px] font-medium text-text-muted font-ui mt-0.5 capitalize leading-tight">
                {status.replace('_', ' ')}
              </p>
            </button>
          )
        })}
      </div>

      {/* Task list — filtered or default (active only) */}
      {visible.length === 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 text-center">
          <p className="text-sm text-text-muted font-ui">{noTasksLabel}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </>
  )
}
