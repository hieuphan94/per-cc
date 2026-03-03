// Telegram Bot API helper — server-side only
// Sends messages to a Telegram chat via the Bot API

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot'

type ParseMode = 'MarkdownV2' | 'HTML' | undefined

interface SendMessageOptions {
  parse_mode?: ParseMode
}

// POST a text message to a Telegram chat
// Logs errors gracefully — never throws
export async function sendMessage(
  chatId: string,
  text: string,
  options: SendMessageOptions = {}
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.error('[telegram] TELEGRAM_BOT_TOKEN not set')
    return
  }

  const url = `${TELEGRAM_API_BASE}${token}/sendMessage`
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
  }

  if (options.parse_mode) {
    body.parse_mode = options.parse_mode
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[telegram] sendMessage failed (${res.status}): ${errText}`)
    }
  } catch (err) {
    console.error('[telegram] sendMessage network error:', err)
  }
}
