// Read-only widget showing active dev tasks on the Morning Briefing page.
// Shows up to 5 tasks (in_progress first), with a link to /dev for full management.

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import type { DevTask } from '@/lib/supabase/types'

type Row = Pick<DevTask, 'id' | 'title' | 'status' | 'project'>

const STATUS_DOT: Record<string, string> = {
  in_progress: 'bg-purple',
  todo:        'bg-accent',
}

interface Props {
  locale: string
}

export async function BriefingDevTasksWidget({ locale }: Props) {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('dev_tasks')
    .select('id, title, status, project')
    .neq('status', 'done')
    .order('status', { ascending: true })   // in_progress before todo
    .order('created_at', { ascending: false })
    .limit(6)

  const tasks = (data ?? []) as Row[]
  if (tasks.length === 0) return null

  const shown = tasks.slice(0, 5)
  const extra = tasks.length > 5 ? tasks.length - 5 : 0

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-mod-dev font-ui">
          Dev Tasks
        </p>
        <Link
          href={`/${locale}/dev`}
          className="text-[11px] font-semibold font-ui text-accent"
        >
          See all →
        </Link>
      </div>

      {/* Task rows */}
      <ul className="divide-y divide-border-subtle">
        {shown.map((task) => (
          <li key={task.id} className="flex items-center gap-3 px-4 py-2.5">
            {/* Status dot */}
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[task.status] ?? 'bg-text-muted'}`} />

            {/* Title */}
            <p className="flex-1 text-sm text-text-secondary font-ui truncate">
              {task.title}
            </p>

            {/* Project badge */}
            {task.project && (
              <span className="text-[10px] font-medium font-ui text-text-muted
                               bg-bg-surface-3 px-1.5 py-0.5 rounded-full flex-shrink-0 truncate max-w-[80px]">
                {task.project}
              </span>
            )}
          </li>
        ))}

        {extra > 0 && (
          <li className="px-4 py-2 text-[11px] text-text-muted font-ui text-center">
            +{extra} more
          </li>
        )}
      </ul>
    </div>
  )
}
