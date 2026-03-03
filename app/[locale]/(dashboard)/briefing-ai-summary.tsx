// Async Server Component — rendered inside <Suspense> on the briefing page
// Calls AI prioritization and returns the focus summary card

import { prioritizeTasks } from '@/lib/ai/prioritize-tasks'
import type { SheetTask } from '@/lib/google-sheets'

interface BriefingAiSummaryProps {
  tasks: SheetTask[]
}

export async function BriefingAiSummary({ tasks }: BriefingAiSummaryProps) {
  const { summary } = await prioritizeTasks(tasks)

  if (!summary) return null

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 flex gap-3">
      {/* Robot icon badge */}
      <span className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-base bg-[#3DD6F518]">
        🤖
      </span>
      <div className="space-y-0.5 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted font-ui">
          AI Focus
        </p>
        <p className="text-sm text-text-primary font-ui leading-relaxed">
          {summary}
        </p>
      </div>
    </div>
  )
}

// Skeleton shown while AI call is in flight
export function BriefingAiSummarySkeleton() {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 flex gap-3 animate-pulse">
      <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-bg-surface-3" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-2.5 w-16 rounded-full bg-bg-surface-3" />
        <div className="h-3.5 w-full rounded-full bg-bg-surface-3" />
        <div className="h-3.5 w-3/4 rounded-full bg-bg-surface-3" />
      </div>
    </div>
  )
}
