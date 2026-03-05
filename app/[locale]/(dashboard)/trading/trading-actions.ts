'use server'

// Server actions for Trading Journal module
// Handles: add trade entry, delete trade entry

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

function revalidateTrading() {
  revalidatePath('/vi/trading')
  revalidatePath('/en/trading')
}

function parseOptionalFloat(value: FormDataEntryValue | null): number | null {
  if (!value || String(value).trim() === '') return null
  const n = parseFloat(String(value))
  return isNaN(n) ? null : n
}

// Add a new trade entry
export async function addEntry(formData: FormData): Promise<{ error?: string }> {
  const result = (formData.get('result') as string | null)?.trim()
  if (!result) return { error: 'Result is required' }

  const entry_date  = (formData.get('entry_date') as string | null) || new Date().toISOString().slice(0, 10)
  const sessionRaw  = (formData.get('session')   as string | null) || null
  const directionRaw = (formData.get('direction') as string | null) || null
  const market      = (formData.get('market')    as string | null)?.trim().toUpperCase() || null
  const notes       = (formData.get('notes')     as string | null)?.trim() || null

  const VALID_SESSIONS  = ['morning', 'afternoon', 'evening'] as const
  const VALID_DIRS      = ['long', 'short'] as const
  const VALID_RESULTS   = ['win', 'loss', 'breakeven'] as const

  const session   = VALID_SESSIONS.includes(sessionRaw as typeof VALID_SESSIONS[number])
    ? (sessionRaw as 'morning' | 'afternoon' | 'evening') : null
  const direction = VALID_DIRS.includes(directionRaw as typeof VALID_DIRS[number])
    ? (directionRaw as 'long' | 'short') : null
  const validResult = VALID_RESULTS.includes(result as typeof VALID_RESULTS[number])
    ? (result as 'win' | 'loss' | 'breakeven') : null
  if (!validResult) return { error: 'Invalid result value' }

  const entry_price = parseOptionalFloat(formData.get('entry_price'))
  const exit_price  = parseOptionalFloat(formData.get('exit_price'))
  const lot_size    = parseOptionalFloat(formData.get('lot_size'))
  const pnl         = parseOptionalFloat(formData.get('pnl'))

  const supabase = createAdminClient()
  const { error } = await supabase.from('trading_entries').insert({
    entry_date,
    session,
    market,
    direction,
    entry_price,
    exit_price,
    lot_size,
    pnl,
    result: validResult,
    notes,
  })

  if (error) return { error: error.message }
  revalidateTrading()
  return {}
}

// Delete a trade entry by id
export async function deleteEntry(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('trading_entries').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateTrading()
  return {}
}
