'use client'

// Interactive task list for Morning Briefing
// Supports status cycling: todo → done → skipped → todo

import { useTransition } from 'react'
import { toggleTaskStatus } from './actions'
import type { BriefingTask } from '@/lib/supabase/types'

interface Props {
  tasks: BriefingTask[]
}

// Priority badge colors (P1 = most urgent)
const PRIORITY_COLORS: Record<number, { text: string; bg: string }> = {
  1: { text: '#F5564A', bg: '#F5564A18' },
  2: { text: '#F5A623', bg: '#F5A62318' },
  3: { text: '#3DD6F5', bg: '#3DD6F518' },
  4: { text: '#8B9BB0', bg: '#8B9BB018' },
  5: { text: '#4A5A6E', bg: '#4A5A6E18' },
}

const NEXT_STATUS: Record<BriefingTask['status'], BriefingTask['status']> = {
  todo: 'done',
  done: 'skipped',
  skipped: 'todo',
}

function TaskCard({ task }: { task: BriefingTask }) {
  const [isPending, startTransition] = useTransition()
  const pc = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS[3]
  const isDone = task.status === 'done'
  const isSkipped = task.status === 'skipped'

  function handleToggle() {
    startTransition(async () => {
      await toggleTaskStatus(task.id, NEXT_STATUS[task.status])
    })
  }

  return (
    <div
      className={`flex items-start gap-3 px-3 py-3 rounded-xl border transition-opacity duration-150
        ${isDone || isSkipped ? 'opacity-50' : 'opacity-100'}
        bg-bg-surface border-border-subtle`}
    >
      {/* Status toggle button */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-label={`Mark as ${NEXT_STATUS[task.status]}`}
        className={`mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors
          ${isDone ? 'bg-[#22D47A] border-[#22D47A]' : isSkipped ? 'bg-[#4A5A6E] border-[#4A5A6E]' : 'border-border-muted bg-transparent'}`}
      >
        {isDone && <span className="text-[10px] text-bg-base font-bold">✓</span>}
        {isSkipped && <span className="text-[10px] text-bg-base font-bold">–</span>}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className={`text-sm font-ui leading-snug ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {task.title}
        </p>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Priority badge */}
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold font-ui"
            style={{ color: pc.text, backgroundColor: pc.bg }}
          >
            P{task.priority}
          </span>

          {/* Source badge */}
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-ui text-text-muted bg-bg-surface-2">
            {task.source === 'sheet' ? '📊' : '✏️'}
          </span>

          {/* Skipped badge */}
          {isSkipped && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-ui text-text-muted bg-bg-surface-2">
              skipped
            </span>
          )}
        </div>

        {/* AI score + note */}
        {task.ai_score !== null && (
          <div className="flex items-start gap-1.5 pt-0.5">
            <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-data font-semibold bg-[#A78BFA]/10 text-[#A78BFA]">
              AI {task.ai_score}/10
            </span>
            {task.ai_note && (
              <p className="text-[11px] font-ui text-text-secondary leading-snug">{task.ai_note}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function BriefingTaskList({ tasks }: Props) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-text-muted font-ui text-center py-8">
        No tasks for today. Add one below or sync from Sheets.
      </p>
    )
  }

  // Sort: todo first, then by ai_score desc, then priority asc
  const sorted = [...tasks].sort((a, b) => {
    if (a.status !== b.status) {
      const order = { todo: 0, done: 1, skipped: 2 }
      return order[a.status] - order[b.status]
    }
    if (a.ai_score !== null && b.ai_score !== null) return b.ai_score - a.ai_score
    if (a.ai_score !== null) return -1
    if (b.ai_score !== null) return 1
    return a.priority - b.priority
  })

  return (
    <div className="space-y-2">
      {sorted.map((task) => <TaskCard key={task.id} task={task} />)}
    </div>
  )
}
