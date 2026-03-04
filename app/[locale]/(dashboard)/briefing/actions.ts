'use server'

// Server actions for Morning Briefing module
// Handles: Sheets sync, manual add, status toggle, AI prioritization

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { fetchTodayTasks } from '@/lib/services/google-sheets-service'
import { prioritizeTasks } from '@/lib/services/briefing-ai-service'
import { format } from 'date-fns'

const today = () => format(new Date(), 'yyyy-MM-dd')

// Pull tasks from Google Sheet into briefing_tasks (dedup by sheet_row_id + task_date)
export async function syncFromSheets(): Promise<{ synced: number; error?: string }> {
  const sheetTasks = await fetchTodayTasks()
  if (sheetTasks.length === 0) return { synced: 0 }

  const supabase = await createClient()
  let synced = 0

  for (const task of sheetTasks) {
    const { error } = await supabase
      .from('briefing_tasks')
      .upsert(
        {
          title: task.title,
          priority: task.priority,
          source: 'sheet',
          sheet_row_id: task.sheetRowId,
          task_date: today(),
          status: 'todo',
        },
        { onConflict: 'sheet_row_id,task_date', ignoreDuplicates: true },
      )
    if (!error) synced++
  }

  revalidatePath('/briefing')
  return { synced }
}

// Add a task manually
export async function addTask(formData: FormData): Promise<{ error?: string }> {
  const title = (formData.get('title') as string | null)?.trim()
  const priorityRaw = parseInt((formData.get('priority') as string | null) ?? '3', 10)
  const priority = Math.min(5, Math.max(1, isNaN(priorityRaw) ? 3 : priorityRaw))

  if (!title) return { error: 'Title is required' }

  const supabase = await createClient()
  const { error } = await supabase.from('briefing_tasks').insert({
    title,
    priority,
    source: 'manual',
    task_date: today(),
  })

  if (error) return { error: error.message }
  revalidatePath('/briefing')
  return {}
}

// Toggle a task's status: todo → done → skipped → todo
export async function toggleTaskStatus(
  taskId: string,
  newStatus: 'todo' | 'done' | 'skipped',
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('briefing_tasks')
    .update({ status: newStatus })
    .eq('id', taskId)

  if (error) return { error: error.message }
  revalidatePath('/briefing')
  return {}
}

// Run AI prioritization: fetch today's tasks → score with gpt-4-mini → update DB
export async function aiPrioritize(): Promise<{ scored: number; error?: string }> {
  const supabase = await createClient()

  const { data: tasks, error: fetchErr } = await supabase
    .from('briefing_tasks')
    .select('id, title, priority')
    .eq('task_date', today())
    .neq('status', 'skipped')

  if (fetchErr) return { scored: 0, error: fetchErr.message }
  if (!tasks || tasks.length === 0) return { scored: 0 }

  const rankings = await prioritizeTasks(tasks)
  if (rankings.length === 0) return { scored: 0, error: 'AI returned no results' }

  let scored = 0
  for (const r of rankings) {
    const { error } = await supabase
      .from('briefing_tasks')
      .update({ ai_score: r.ai_score, ai_note: r.ai_note })
      .eq('id', r.id)
    if (!error) scored++
  }

  revalidatePath('/briefing')
  return { scored }
}
