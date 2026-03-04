'use client'

// Sync from Sheets button — triggers Google Sheets → Supabase import

import { useTransition, useState } from 'react'
import { syncFromSheets } from './actions'

export function BriefingSyncButton() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  function handleClick() {
    setMessage(null)
    startTransition(async () => {
      const result = await syncFromSheets()
      if (result.error) {
        setMessage(`Error: ${result.error}`)
      } else {
        setMessage(result.synced > 0 ? `✓ Synced ${result.synced} tasks` : 'No new tasks')
      }
      setTimeout(() => setMessage(null), 3000)
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl
                   bg-[#22D47A]/10 border border-[#22D47A]/30
                   text-sm font-semibold font-ui text-[#22D47A]
                   disabled:opacity-40 active:bg-[#22D47A]/20 transition-colors"
      >
        <span>{isPending ? '⏳' : '📊'}</span>
        <span>{isPending ? 'Syncing...' : 'Sync Sheets'}</span>
      </button>

      {message && (
        <p className="text-[11px] font-ui text-text-secondary text-center">{message}</p>
      )}
    </div>
  )
}
