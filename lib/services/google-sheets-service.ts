// Google Sheets API wrapper — reads tasks for Morning Briefing
// Expects sheet columns: A=title, B=priority (1-5), C=date (DD/MM/YYYY or YYYY-MM-DD)
// Uses service account JWT auth (server-side only, never sent to client)

import { google } from 'googleapis'
import { format } from 'date-fns'

export interface SheetTask {
  title: string
  priority: number    // 1-5, defaults to 3 if missing/invalid
  sheetRowId: string  // row index string for dedup
}

function buildAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !privateKey) {
    throw new Error('Missing Google service account credentials in env')
  }
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
}

function normalizeDate(raw: string): string {
  // Accepts DD/MM/YYYY or YYYY-MM-DD → returns YYYY-MM-DD
  if (!raw) return ''
  if (raw.includes('/')) {
    const [d, m, y] = raw.trim().split('/')
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return raw.trim()
}

// Fetch tasks matching today's date from the configured Google Sheet
export async function fetchTodayTasks(): Promise<SheetTask[]> {
  const sheetId = process.env.GOOGLE_SHEET_TASKS_ID
  if (!sheetId) {
    console.error('[google-sheets] GOOGLE_SHEET_TASKS_ID not set')
    return []
  }

  try {
    const auth = buildAuth()
    const sheets = google.sheets({ version: 'v4', auth })
    const today = format(new Date(), 'yyyy-MM-dd')

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A:C',  // title | priority | date
    })

    const rows = response.data.values ?? []
    const tasks: SheetTask[] = []

    // Skip header row (row index 0)
    for (let i = 1; i < rows.length; i++) {
      const [title, priorityRaw, dateRaw] = rows[i]
      if (!title || !dateRaw) continue

      const taskDate = normalizeDate(String(dateRaw))
      if (taskDate !== today) continue

      const priority = Math.min(5, Math.max(1, parseInt(String(priorityRaw), 10) || 3))
      tasks.push({ title: String(title).trim(), priority, sheetRowId: String(i) })
    }

    return tasks
  } catch (err) {
    console.error('[google-sheets] fetchTodayTasks failed:', err)
    return []
  }
}
