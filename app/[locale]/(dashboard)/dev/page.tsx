import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import type { DevTask, DevLog } from '@/lib/supabase/types'

type DevTaskRow = Pick<DevTask, 'id' | 'title' | 'status' | 'priority'>
type DevLogRow  = Pick<DevLog,  'id' | 'log_date' | 'done' | 'blocked' | 'next'>

interface DevPageProps {
  params: { locale: string }
}

const STATUS_ORDER = ['in_progress', 'todo', 'blocked', 'done'] as const

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

export default async function DevPage({ params }: DevPageProps) {
  void params
  const t = await getTranslations('dev')
  const supabase = await createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const [tasksResult, logResult] = await Promise.all([
    supabase
      .from('dev_tasks')
      .select('id, title, status, priority')
      .in('status', ['todo', 'in_progress', 'blocked', 'done'])
      .order('status', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('dev_logs')
      .select('id, log_date, done, blocked, next')
      .eq('log_date', today)
      .maybeSingle(),
  ])

  const tasks   = (tasksResult.data ?? []) as DevTaskRow[]
  const todayLog = logResult.data as DevLogRow | null

  // Count by status
  const counts = tasks.reduce<Record<string, number>>(
    (acc, task) => { acc[task.status] = (acc[task.status] ?? 0) + 1; return acc },
    {}
  )

  // Show only active tasks (not done)
  const activeTasks = tasks.filter((t) => t.status !== 'done')

  return (
    <div className="space-y-4 pt-4">

      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-mod-dev font-ui mb-0.5">
          {t('moduleLabel')}
        </p>
        <p className="text-lg font-semibold text-text-primary font-ui">{t('title')}</p>
      </div>

      {/* Status tabs row */}
      <div className="grid grid-cols-4 gap-2">
        {STATUS_ORDER.map((status) => (
          <div
            key={status}
            className="bg-bg-surface border border-border-subtle rounded-2xl p-3 text-center"
          >
            <p className={`text-xl font-bold font-data ${STATUS_STYLES[status]?.split(' ')[1] ?? 'text-text-primary'}`}>
              {counts[status] ?? 0}
            </p>
            <p className="text-[9px] font-medium text-text-muted font-ui mt-0.5 capitalize leading-tight">
              {status.replace('_', ' ')}
            </p>
          </div>
        ))}
      </div>

      {/* Active task list */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('tasks')}
        </p>

        {activeTasks.length === 0 ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 text-center">
            <p className="text-sm text-text-muted font-ui">{t('noTasks')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5
                           flex items-start gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary font-ui">{task.title}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {task.priority && (
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui
                                     ${PRIORITY_STYLES[task.priority] ?? 'bg-bg-surface-3 text-text-muted'}`}>
                      {task.priority}
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui
                                   ${STATUS_STYLES[task.status] ?? 'bg-bg-surface-3 text-text-muted'}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Daily log section */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui mb-2">
          {t('dailyLog')}
        </p>

        {!todayLog ? (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 text-center">
            <p className="text-sm text-text-muted font-ui">{t('noLog')}</p>
          </div>
        ) : (
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-3">
            {(todayLog.done?.length ?? 0) > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase text-success font-ui mb-1">
                  {t('logDone')}
                </p>
                <ul className="space-y-1">
                  {todayLog.done!.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary font-ui">
                      <span className="text-success mt-0.5 flex-shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(todayLog.blocked?.length ?? 0) > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase text-danger font-ui mb-1">
                  {t('logBlocked')}
                </p>
                <ul className="space-y-1">
                  {todayLog.blocked!.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary font-ui">
                      <span className="text-danger mt-0.5 flex-shrink-0">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(todayLog.next?.length ?? 0) > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase text-accent font-ui mb-1">
                  {t('logNext')}
                </p>
                <ul className="space-y-1">
                  {todayLog.next!.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary font-ui">
                      <span className="text-accent mt-0.5 flex-shrink-0">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  )
}
