'use server'

// Server actions for Learning Tracker module
// Handles: add learning entry, delete entry

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import type { LearningEntry } from '@/lib/supabase/types'

function revalidateLearning() {
  revalidatePath('/vi/learning')
  revalidatePath('/en/learning')
}

const VALID_TYPES = ['reading', 'ai_tool', 'english', 'other'] as const

// Add a new learning log entry
export async function addLearningEntry(formData: FormData): Promise<{ error?: string }> {
  const title      = (formData.get('title')      as string | null)?.trim()
  const typeRaw    = (formData.get('entry_type') as string | null)
  const source     = (formData.get('source')     as string | null)?.trim() || null
  const notes      = (formData.get('notes')      as string | null)?.trim() || null
  const entry_date = (formData.get('entry_date') as string | null) || new Date().toISOString().slice(0, 10)

  if (!title) return { error: 'Title is required' }

  const entry_type = VALID_TYPES.includes(typeRaw as typeof VALID_TYPES[number])
    ? (typeRaw as LearningEntry['entry_type'])
    : 'other'

  const supabase = createAdminClient()
  const { error } = await supabase.from('learning_entries').insert({
    title,
    entry_type,
    entry_date,
    source,
    notes,
  })

  if (error) return { error: error.message }
  revalidateLearning()
  return {}
}

// Delete a learning entry
export async function deleteLearningEntry(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('learning_entries').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateLearning()
  return {}
}
