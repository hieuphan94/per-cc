// Dashboard widget — Morning Briefing summary (today's task counts)

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

interface Props { locale: string }

export async function DashboardBriefingWidget({ locale }: Props) {
  const supabase = createAdminClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data } = await supabase
    .from('briefing_tasks')
    .select('status')
    .eq('task_date', today)

  const tasks = data ?? []
  const todo  = tasks.filter(t => t.status === 'todo').length
  const done  = tasks.filter(t => t.status === 'done').length
  const total = tasks.length

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-mod-briefing font-ui">
          Morning Briefing
        </p>
        <Link href={`/${locale}/briefing`} className="text-[11px] font-semibold font-ui text-accent">
          Open →
        </Link>
      </div>

      {total === 0 ? (
        <p className="px-4 py-3 text-sm text-text-muted font-ui">No tasks today.</p>
      ) : (
        <div className="grid grid-cols-3 divide-x divide-border-subtle">
          {[
            { label: 'Total', value: total, color: 'text-text-primary' },
            { label: 'To do',  value: todo,  color: 'text-accent' },
            { label: 'Done',  value: done,  color: 'text-success' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col items-center py-3 gap-0.5">
              <span className={`text-xl font-bold font-data ${color}`}>{value}</span>
              <span className="text-[10px] text-text-muted font-ui">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
