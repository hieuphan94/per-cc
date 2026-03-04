import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { createAdminClient } from '@/lib/supabase/server'
import type { DevTask, DevLog } from '@/lib/supabase/types'
import { AddTaskForm } from './add-task-form'
import { DailyLogForm } from './daily-log-form'
import { SyncSheetButton } from './sync-sheet-button'
import { TaskListWithFilter } from './task-list-with-filter'

type DevTaskRow = Pick<DevTask, 'id' | 'title' | 'status' | 'priority'>
type DevLogRow  = Pick<DevLog,  'done' | 'blocked' | 'next'>

export default async function DevPage() {
  const t = await getTranslations('dev')
  const supabase = createAdminClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const [tasksResult, logResult] = await Promise.all([
    supabase
      .from('dev_tasks')
      .select('id, title, status, priority')
      .order('status', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('dev_logs')
      .select('done, blocked, next')
      .eq('log_date', today)
      .maybeSingle(),
  ])

  const tasks    = (tasksResult.data ?? []) as DevTaskRow[]
  const todayLog = logResult.data as DevLogRow | null

  return (
    <div className="space-y-4 pt-4">

      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-mod-dev font-ui mb-0.5">
          {t('moduleLabel')}
        </p>
        <p className="text-lg font-semibold text-text-primary font-ui">{t('title')}</p>
      </div>

      {/* Tasks section — status cards act as filters, list updates client-side */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
            {t('tasks')}
          </p>
          <div className="flex items-center gap-2">
            <SyncSheetButton />
            <AddTaskForm />
          </div>
        </div>
        <div className="space-y-2">
          <TaskListWithFilter tasks={tasks} noTasksLabel={t('noTasks')} />
        </div>
      </section>

      {/* Daily log */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('dailyLog')}
        </p>
        <DailyLogForm date={today} initial={todayLog} />
      </section>

    </div>
  )
}
