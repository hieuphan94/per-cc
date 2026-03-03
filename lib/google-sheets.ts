// Google Sheets API helper — server-side only (uses service account credentials)
// Fetches tasks from configured spreadsheets using a shared service account

import { google } from 'googleapis'
import type { DevTask } from './supabase/types'

export interface SheetTask {
  rowId: string    // e.g. "row_2", "row_3" — stable identifier
  title: string
  notes: string | null
  status: 'pending' | 'done'
}

// Dev task row read from a Google Sheet
// Column convention: A=title, B=description, C=status, D=priority
export interface DevSheetTask {
  rowId: string
  title: string
  description: string | null
  status: DevTask['status']
  priority: DevTask['priority']
}

// Column convention: A = title, B = notes (optional), C = status ("done" to exclude)
const DEFAULT_RANGE = 'Sheet1!A:C'
const DEV_TASKS_DEFAULT_RANGE = 'Sheet1!A:D'

// Build a shared GoogleAuth client from the service account env var
// readOnly=true → spreadsheets.readonly scope; false → full spreadsheets scope (for writes)
async function getSheetAuth(readOnly = true) {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!serviceAccountJson) return null
  const credentials = JSON.parse(serviceAccountJson)
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [readOnly
      ? 'https://www.googleapis.com/auth/spreadsheets.readonly'
      : 'https://www.googleapis.com/auth/spreadsheets'],
  })
}

export async function fetchBriefingTasks(): Promise<SheetTask[]> {
  const sheetId = process.env.BRIEFING_SHEET_ID
  const range   = process.env.BRIEFING_SHEET_RANGE ?? DEFAULT_RANGE
  if (!sheetId) return []

  const auth = await getSheetAuth()
  if (!auth) return []

  const sheets   = google.sheets({ version: 'v4', auth })
  const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range })
  const rows     = response.data.values ?? []

  // Skip header row, skip rows with empty title or status=done
  return rows
    .slice(1)
    .map((row, index) => {
      const title  = (row[0] as string | undefined)?.trim() ?? ''
      const notes  = (row[1] as string | undefined)?.trim() || null
      const status = ((row[2] as string | undefined)?.trim().toLowerCase() === 'done'
        ? 'done' : 'pending') as SheetTask['status']
      return { rowId: `row_${index + 2}`, title, notes, status }
    })
    .filter((task) => task.title.length > 0 && task.status !== 'done')
}

// Fetch dev tasks from a separate Google Sheet
// Columns: A=title, B=description, C=status (todo/in_progress/done/blocked), D=priority (high/medium/low)
export async function fetchDevTasksFromSheet(): Promise<DevSheetTask[]> {
  const sheetId = process.env.DEV_TASKS_SHEET_ID
  const range   = process.env.DEV_TASKS_SHEET_RANGE ?? DEV_TASKS_DEFAULT_RANGE
  if (!sheetId) return []

  const auth = await getSheetAuth()
  if (!auth) return []

  const sheets   = google.sheets({ version: 'v4', auth })
  const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range })
  const rows     = response.data.values ?? []

  const VALID_STATUSES   = new Set(['todo', 'in_progress', 'done', 'blocked'])
  const VALID_PRIORITIES = new Set(['high', 'medium', 'low'])

  return rows
    .slice(1)
    .map((row, index) => {
      const title       = (row[0] as string | undefined)?.trim() ?? ''
      const description = (row[1] as string | undefined)?.trim() || null
      const rawStatus   = (row[2] as string | undefined)?.trim().toLowerCase() ?? ''
      const rawPriority = (row[3] as string | undefined)?.trim().toLowerCase() ?? ''

      const status   = VALID_STATUSES.has(rawStatus)   ? rawStatus   as DevTask['status']   : 'todo'
      const priority = VALID_PRIORITIES.has(rawPriority) ? rawPriority as DevTask['priority'] : null

      return { rowId: `row_${index + 2}`, title, description, status, priority }
    })
    .filter((task) => task.title.length > 0)
}

// Append a new task row to the dev tasks Google Sheet
// Returns the sheet_row_id (e.g. "row_5") of the newly appended row, or null on failure
export async function appendDevTaskToSheet(
  title: string,
  description: string | null,
  status: DevTask['status'],
  priority: DevTask['priority'],
): Promise<string | null> {
  const sheetId = process.env.DEV_TASKS_SHEET_ID
  const range   = process.env.DEV_TASKS_SHEET_RANGE ?? DEV_TASKS_DEFAULT_RANGE
  if (!sheetId) return null

  const auth = await getSheetAuth(false) // write scope
  if (!auth) return null

  const sheets = google.sheets({ version: 'v4', auth })

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[title, description ?? '', status, priority ?? '']],
    },
  })

  // Extract the row number from the updated range (e.g. "Sheet1!A5:D5" → "row_5")
  const updatedRange = response.data.updates?.updatedRange ?? ''
  const match = updatedRange.match(/[A-Z]+(\d+)/)
  if (!match) return null
  return `row_${match[1]}`
}
