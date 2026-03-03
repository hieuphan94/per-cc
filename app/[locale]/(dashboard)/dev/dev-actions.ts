'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { fetchDevTasksFromSheet, appendDevTaskToSheet } from '@/lib/google-sheets'
import type { DevTask } from '@/lib/supabase/types'

// Revalidate both locale variants of the dev page
function revalidateDev() {
  revalidatePath('/vi/dev')
  revalidatePath('/en/dev')
}

// Split newline-separated textarea value into a clean string array
function parseLines(value: FormDataEntryValue | null): string[] {
  if (!value || typeof value !== 'string') return []
  return value.split('\n').map((l) => l.trim()).filter(Boolean)
}

// Status advancement cycle: todo → in_progress → done → todo (or blocked → todo)
const STATUS_CYCLE: Record<DevTask['status'], DevTask['status']> = {
  todo:        'in_progress',
  in_progress: 'done',
  blocked:     'todo',
  done:        'todo',
}

export async function addDevTask(formData: FormData) {
  const title    = (formData.get('title')    as string | null)?.trim()
  if (!title) return
  const priority = (formData.get('priority') as string | null) || null
  const status: DevTask['status'] = 'todo'

  // Append to Google Sheet first to get the stable sheet_row_id
  const sheetRowId = await appendDevTaskToSheet(
    title,
    null,
    status,
    priority as DevTask['priority'],
  ).catch(() => null)

  const supabase = createAdminClient()
  await supabase.from('dev_tasks').insert({
    title,
    status,
    priority:     priority as DevTask['priority'],
    sheet_row_id: sheetRowId, // null if sheet not configured or append failed
  })

  revalidateDev()
}

// Delete a task from DB only — does NOT touch Google Sheet
export async function deleteDevTask(id: string) {
  const supabase = createAdminClient()
  await supabase.from('dev_tasks').delete().eq('id', id)
  revalidateDev()
}

export async function cycleTaskStatus(id: string, currentStatus: DevTask['status']) {
  const supabase = createAdminClient()

  await supabase
    .from('dev_tasks')
    .update({ status: STATUS_CYCLE[currentStatus] })
    .eq('id', id)

  revalidateDev()
}

// Sync tasks from Google Sheet → upsert into dev_tasks by sheet_row_id
// - New rows: inserted as 'todo'
// - Existing rows: title/description/priority updated; status only overridden if sheet says 'done'
// Returns count of rows processed
export async function syncDevTasksFromSheet(): Promise<{ synced: number; error?: string }> {
  let rows
  try {
    rows = await fetchDevTasksFromSheet()
  } catch (err) {
    return { synced: 0, error: String(err) }
  }

  if (rows.length === 0) return { synced: 0 }

  // Use admin client to bypass RLS — this action runs server-side only
  const supabase = createAdminClient()
  const now      = new Date().toISOString()

  try {
    // Load existing sheet-synced tasks to decide insert vs update
    const { data: existing, error: fetchError } = await supabase
      .from('dev_tasks')
      .select('id, sheet_row_id, status')
      .not('sheet_row_id', 'is', null)

    if (fetchError) return { synced: 0, error: fetchError.message }

    type ExistingRow = { id: string; sheet_row_id: string | null; status: DevTask['status'] }
    const existingMap = new Map(
      ((existing ?? []) as ExistingRow[]).map((t) => [t.sheet_row_id as string, t])
    )

    // Sheet row IDs present in the current sheet fetch
    const sheetRowIds = new Set(rows.map((r) => r.rowId))

    // Delete DB tasks whose sheet_row_id no longer exists in the sheet
    const toDelete = ((existing ?? []) as ExistingRow[])
      .filter((t) => t.sheet_row_id && !sheetRowIds.has(t.sheet_row_id))
      .map((t) => t.id)

    if (toDelete.length > 0) {
      const { error } = await supabase.from('dev_tasks').delete().in('id', toDelete)
      if (error) return { synced: 0, error: error.message }
    }

    // Insert or update remaining rows
    for (const row of rows) {
      const match = existingMap.get(row.rowId)

      if (match) {
        // Preserve manually-set status unless sheet explicitly marks done
        const statusUpdate = row.status === 'done' ? { status: 'done' as const } : {}
        const { error } = await supabase
          .from('dev_tasks')
          .update({ title: row.title, description: row.description, priority: row.priority, synced_at: now, ...statusUpdate })
          .eq('id', match.id)
        if (error) return { synced: 0, error: error.message }
      } else {
        const { error } = await supabase.from('dev_tasks').insert({
          sheet_row_id: row.rowId,
          title:        row.title,
          description:  row.description,
          status:       row.status === 'done' ? 'todo' : row.status,
          priority:     row.priority,
          synced_at:    now,
        })
        if (error) return { synced: 0, error: error.message }
      }
    }
  } catch (err) {
    return { synced: 0, error: String(err) }
  }

  revalidateDev()
  return { synced: rows.length }
}

export async function saveDailyLog(formData: FormData) {
  const date    = formData.get('date') as string
  const done    = parseLines(formData.get('done'))
  const blocked = parseLines(formData.get('blocked'))
  const next    = parseLines(formData.get('next'))

  const supabase = createAdminClient()

  await supabase
    .from('dev_logs')
    .upsert({ log_date: date, done, blocked, next }, { onConflict: 'log_date' })

  revalidateDev()
}
