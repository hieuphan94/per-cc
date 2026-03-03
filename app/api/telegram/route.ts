// Telegram webhook handler — POST only
// Validates secret token, routes commands, replies via Bot API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendMessage } from '@/lib/telegram'
import type { Database } from '@/lib/supabase/types'

type TradingEntryInsert = Database['public']['Tables']['trading_entries']['Insert']

// --- Telegram update types (minimal subset) ---
interface TelegramMessage {
  message_id: number
  chat: { id: number }
  text?: string
}

interface TelegramUpdate {
  message?: TelegramMessage
}

// --- Session alias map ---
const SESSION_MAP: Record<string, 'morning' | 'afternoon' | 'evening'> = {
  morning: 'morning', m: 'morning',
  afternoon: 'afternoon', a: 'afternoon',
  evening: 'evening', e: 'evening',
}

const HELP_TEXT = `Commands:
/log <session> <market> <direction> <entry> <exit> <lot> [win|loss|be]
/note <text>
/status
/help`

// Calculate P&L: pip value simplified — (exit - entry) * lot * direction multiplier
function calcPnl(entry: number, exit: number, lot: number, direction: 'long' | 'short'): number {
  const diff = direction === 'long' ? exit - entry : entry - exit
  return parseFloat((diff * lot * 100).toFixed(2))
}

async function handleLog(parts: string[], msgId: number, chatId: string): Promise<void> {
  // parts[0] = '/log', then: session market direction entry exit lot [result]
  const [, sessionRaw, market, directionRaw, entryRaw, exitRaw, lotRaw, resultRaw] = parts

  if (!sessionRaw || !market || !directionRaw || !entryRaw || !exitRaw || !lotRaw) {
    await sendMessage(chatId, 'Usage: /log <session> <market> <direction> <entry> <exit> <lot> [win|loss|be]')
    return
  }

  const session = SESSION_MAP[sessionRaw.toLowerCase()]
  if (!session) {
    await sendMessage(chatId, `Unknown session "${sessionRaw}". Use morning/afternoon/evening (or m/a/e).`)
    return
  }

  const direction = directionRaw.toLowerCase() as 'long' | 'short'
  if (direction !== 'long' && direction !== 'short') {
    await sendMessage(chatId, 'Direction must be long or short.')
    return
  }

  const entry = parseFloat(entryRaw)
  const exit = parseFloat(exitRaw)
  const lot = parseFloat(lotRaw)

  if (isNaN(entry) || isNaN(exit) || isNaN(lot)) {
    await sendMessage(chatId, 'Entry, exit, and lot must be numbers.')
    return
  }

  const resultAlias: Record<string, 'win' | 'loss' | 'breakeven'> = {
    win: 'win', loss: 'loss', be: 'breakeven', breakeven: 'breakeven',
  }
  const result = resultRaw ? resultAlias[resultRaw.toLowerCase()] ?? null : null
  const pnl = calcPnl(entry, exit, lot, direction)
  const today = new Date().toISOString().slice(0, 10)

  try {
    const supabase = await createClient()
    const row: TradingEntryInsert = {
      entry_date: today,
      session,
      market: market.toUpperCase(),
      direction,
      entry_price: entry,
      exit_price: exit,
      lot_size: lot,
      pnl,
      result,
      notes: null,
      telegram_msg_id: msgId,
    }
    // Supabase insert() overload resolves to `never` when TablesRelationships is empty
    // in the Database type — row shape is validated via TradingEntryInsert satisfies above
    await supabase.from('trading_entries').insert(row as never)

    await sendMessage(
      chatId,
      `Logged: ${market.toUpperCase()} ${direction} | P&L: ${pnl > 0 ? '+' : ''}${pnl}${result ? ` | ${result}` : ''}`
    )
  } catch (err) {
    console.error('[telegram/log] DB error:', err)
    await sendMessage(chatId, 'Failed to save trade. Please try again.')
  }
}

async function handleStatus(chatId: string): Promise<void> {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().slice(0, 10)

    const [tradesRes, sitesRes] = await Promise.all([
      supabase.from('trading_entries').select('session').eq('entry_date', today),
      supabase.from('wordpress_sites').select('url').eq('last_status', 'offline').eq('is_active', true),
    ])

    type SessionRow = { session: string | null }
    type SiteRow = { url: string }

    const trades = (tradesRes.data ?? []) as SessionRow[]
    const offlineSites = (sitesRes.data ?? []) as SiteRow[]

    const sessions = { morning: false, afternoon: false, evening: false }
    for (const t of trades) {
      if (t.session && t.session in sessions) sessions[t.session as keyof typeof sessions] = true
    }

    const dd = new Date()
    const dateStr = `${String(dd.getDate()).padStart(2, '0')}/${String(dd.getMonth() + 1).padStart(2, '0')}`
    const tradingLine = `Trading: morning ${sessions.morning ? '✓' : '—'} | afternoon ${sessions.afternoon ? '✓' : '—'} | evening ${sessions.evening ? '✓' : '—'}`

    const siteLine = offlineSites.length === 0
      ? 'Sites: all online'
      : `Sites: ${offlineSites.length} offline → ${offlineSites.map((s) => s.url).join(', ')}`

    await sendMessage(chatId, `Status — ${dateStr}\n${tradingLine}\n${siteLine}`)
  } catch (err) {
    console.error('[telegram/status] error:', err)
    await sendMessage(chatId, 'Failed to fetch status.')
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Validate secret token
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (!secret || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let update: TelegramUpdate
  try {
    update = (await req.json()) as TelegramUpdate
  } catch {
    return NextResponse.json({ ok: true })
  }

  const msg = update.message
  // Silently ignore non-text updates
  if (!msg?.text) return NextResponse.json({ ok: true })

  const chatId = String(msg.chat.id)
  const text = msg.text.trim()
  const parts = text.split(/\s+/)
  const command = parts[0].toLowerCase()

  if (command === '/start' || command === '/help') {
    await sendMessage(chatId, HELP_TEXT)
  } else if (command === '/log') {
    await handleLog(parts, msg.message_id, chatId)
  } else if (command === '/note') {
    await sendMessage(chatId, 'Noted.')
  } else if (command === '/status') {
    await handleStatus(chatId)
  } else {
    await sendMessage(chatId, 'Unknown command. /help for list.')
  }

  return NextResponse.json({ ok: true })
}
