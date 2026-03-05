'use client'

import { useState } from 'react'
import { TaskCard } from './task-card'
import type { DevTask } from '@/lib/supabase/types'

type TaskRow = Pick<DevTask, 'id' | 'title' | 'status' | 'priority' | 'description' | 'project' | 'due_date'>

interface Props {
  tasks: TaskRow[]
  noTasksLabel: string
}

const STATUS_ORDER = ['in_progress', 'todo'] as const
type StatusFilter = typeof STATUS_ORDER[number] | null

const STATUS_COLOR: Record<string, string> = {
  in_progress: 'text-purple',
  todo:        'text-accent',
}

const STATUS_RING: Record<string, string> = {
  in_progress: 'ring-purple/40',
  todo:        'ring-accent/40',
}

// Group tasks by project name; null project → 'No project' group (shown last)
function groupByProject(tasks: TaskRow[]): [string, TaskRow[]][] {
  const map = new Map<string, TaskRow[]>()

  for (const task of tasks) {
    const key = task.project?.trim() || ''
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(task)
  }

  // Named projects first (alphabetical), then no-project group
  const named   = Array.from(map.entries()).filter(([k]) => k !== '').sort(([a], [b]) => a.localeCompare(b))
  const unnamed = map.has('') ? [['', map.get('')!] as [string, TaskRow[]]] : []
  return [...named, ...unnamed]
}

// Collapsible project section
function ProjectGroup({ name, tasks }: { name: string; tasks: TaskRow[] }) {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full mb-1.5 group"
      >
        <span className={`text-[9px] transition-transform duration-150 text-text-muted ${open ? 'rotate-90' : ''}`}>▶</span>
        <span className="text-[11px] font-semibold font-ui text-text-secondary truncate">
          {name || 'No project'}
        </span>
        <span className="text-[10px] text-text-muted font-data">({tasks.length})</span>
      </button>

      {open && (
        <div className="space-y-2 pl-3 border-l border-border-subtle ml-1">
          {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        </div>
      )}
    </div>
  )
}

export function TaskListWithFilter({ tasks, noTasksLabel }: Props) {
  const [filter, setFilter] = useState<StatusFilter>(null)

  const counts = tasks.reduce<Record<string, number>>(
    (acc, t) => { acc[t.status] = (acc[t.status] ?? 0) + 1; return acc },
    {}
  )

  // Apply status filter; if no filter, show all active tasks
  const filtered = filter ? tasks.filter((t) => t.status === filter) : tasks
  const groups   = groupByProject(filtered)

  function toggleFilter(status: StatusFilter) {
    setFilter((prev) => (prev === status ? null : status))
  }

  return (
    <>
      {/* Status filter pills */}
      <div className="grid grid-cols-2 gap-2">
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

      {/* Grouped task list */}
      {filtered.length === 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 text-center">
          <p className="text-sm text-text-muted font-ui">{noTasksLabel}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(([project, groupTasks]) => (
            <ProjectGroup key={project} name={project} tasks={groupTasks} />
          ))}
        </div>
      )}
    </>
  )
}
