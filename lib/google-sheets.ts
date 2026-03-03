// Google Sheets API helper — server-side only (uses service account credentials)
// Fetches today's personal tasks from a configured spreadsheet

import { google } from 'googleapis'

export interface SheetTask {
  rowId: string    // e.g. "row_2", "row_3" — stable identifier
  title: string
  notes: string | null
  status: 'pending' | 'done'
}

// Column convention: A = title, B = notes (optional), C = status ("done" to exclude)
const DEFAULT_RANGE = 'Sheet1!A:C'

export async function fetchBriefingTasks(): Promise<SheetTask[]> {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  const sheetId = process.env.BRIEFING_SHEET_ID
  const range = process.env.BRIEFING_SHEET_RANGE ?? DEFAULT_RANGE

  // Return empty gracefully if env vars not configured
  if (!serviceAccountJson || !sheetId) return []

  const credentials = JSON.parse(serviceAccountJson)

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  })

  const rows = response.data.values ?? []

  // Skip header row (row index 0), skip rows with empty title
  return rows
    .slice(1)
    .map((row, index) => {
      const title = (row[0] as string | undefined)?.trim() ?? ''
      const notes = (row[1] as string | undefined)?.trim() || null
      const status = ((row[2] as string | undefined)?.trim().toLowerCase() === 'done'
        ? 'done'
        : 'pending') as SheetTask['status']
      return { rowId: `row_${index + 2}`, title, notes, status }
    })
    .filter((task) => task.title.length > 0 && task.status !== 'done')
}
