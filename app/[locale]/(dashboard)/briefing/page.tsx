// Morning Briefing page — Server Component
// Fetches today's tasks + domain alerts, passes to interactive Client Components

import { createAdminClient } from '@/lib/supabase/server'
import type { BriefingTask, WordPressSite } from '@/lib/supabase/types'
import { format } from 'date-fns'
import { BriefingAlertStrip } from './briefing-alert-strip'
import { BriefingTaskList } from './briefing-task-list'
import { BriefingAddForm } from './briefing-add-form'
import { BriefingAiButton } from './briefing-ai-button'
import { BriefingSyncButton } from './briefing-sync-button'
import { BriefingDevTasksWidget } from './briefing-dev-tasks-widget'

const today = () => format(new Date(), 'yyyy-MM-dd')

export default async function BriefingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = createAdminClient()

  // Fetch today's tasks ordered by ai_score desc (nulls last), then priority asc
  const { data: rawTasks = [] } = await supabase
    .from('briefing_tasks')
    .select('*')
    .eq('task_date', today())
    .order('ai_score', { ascending: false, nullsFirst: false })
    .order('priority', { ascending: true })
  const tasks = (rawTasks ?? []) as BriefingTask[]

  // Fetch offline/warning WordPress sites for alert strip
  const { data: rawAlerts = [] } = await supabase
    .from('wordpress_sites')
    .select('name, url, last_status')
    .in('last_status', ['offline', 'warning'])
    .eq('is_active', true)
  const alertSites = (rawAlerts ?? []) as Pick<WordPressSite, 'name' | 'url' | 'last_status'>[]

  const todoCount = tasks?.filter(t => t.status === 'todo').length ?? 0
  const hasUnscoredTasks = (tasks ?? []).some(t => t.ai_score === null && t.status !== 'skipped')

  return (
    <div className="space-y-5 pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
            Morning Briefing
          </p>
          <p className="text-lg font-semibold text-text-primary font-ui leading-snug mt-0.5">
            Today&apos;s Tasks
            {todoCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs
                               font-data font-semibold bg-accent/10 text-accent">
                {todoCount}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Domain alerts */}
      <BriefingAlertStrip alerts={alertSites} />

      {/* Action buttons row */}
      <div className="grid grid-cols-2 gap-2">
        <BriefingSyncButton />
        <BriefingAiButton hasUnscoredTasks={hasUnscoredTasks} />
      </div>

      {/* Task list */}
      <BriefingTaskList tasks={tasks ?? []} />

      {/* Manual add form */}
      <BriefingAddForm />

      {/* Dev tasks widget */}
      <BriefingDevTasksWidget locale={locale} />
    </div>
  )
}
