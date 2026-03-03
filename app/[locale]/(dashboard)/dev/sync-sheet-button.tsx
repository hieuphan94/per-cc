'use client'

import { useTransition, useState } from 'react'
import { useTranslations } from 'next-intl'
import { syncDevTasksFromSheet } from './dev-actions'

export function SyncSheetButton() {
  const t = useTranslations('dev')
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<string | null>(null)

  function handleSync() {
    setResult(null)
    startTransition(async () => {
      const res = await syncDevTasksFromSheet()
      setResult(res.error ? `✗ ${res.error}` : `✓ +${res.synced}`)
      // Clear feedback after 4s
      setTimeout(() => setResult(null), 4000)
    })
  }

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={pending}
      className="text-[11px] font-semibold font-ui text-text-muted opacity-80
                 border border-border-muted rounded-lg px-2 py-0.5
                 disabled:opacity-40 active:scale-95 transition-transform"
    >
      {pending ? '↻' : result ?? t('syncSheet')}
    </button>
  )
}
