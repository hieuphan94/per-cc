'use client'

// EOD report trigger button — generates summary and optionally sends to Telegram

import { useState, useTransition } from 'react'
import { generateEodReport } from './report-actions'

interface GenerateReportButtonProps {
  labelGenerate: string
  labelSent: string
  labelSkipped: string
}

export function GenerateReportButton({ labelGenerate, labelSent, labelSkipped }: GenerateReportButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [summary, setSummary]        = useState<string | null>(null)
  const [error, setError]            = useState<string | null>(null)
  const [sentLabel, setSentLabel]    = useState<string | null>(null)

  function handleGenerate() {
    setSummary(null)
    setError(null)
    setSentLabel(null)
    startTransition(async () => {
      const res = await generateEodReport()
      if (!res.success) {
        setError(res.error ?? 'Failed')
      } else {
        setSummary(res.summary ?? null)
        // Distinguish sent vs skipped (no Telegram configured)
        setSentLabel(res.summary?.includes('Generated') ? labelSent : labelSkipped)
      }
    })
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isPending}
        className="w-full py-3 rounded-2xl bg-mod-reports/10 border border-mod-reports/30
                   text-sm font-semibold font-ui text-mod-reports disabled:opacity-50
                   flex items-center justify-center gap-2"
      >
        {isPending ? (
          <><span className="animate-spin">⟳</span> Generating…</>
        ) : (
          `✦ ${labelGenerate}`
        )}
      </button>

      {error && (
        <p className="text-[11px] text-danger font-ui text-center">{error}</p>
      )}

      {summary && (
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-2">
          {sentLabel && (
            <p className="text-[10px] font-semibold text-success font-ui">✓ {sentLabel}</p>
          )}
          <pre className="text-[11px] text-text-muted font-data whitespace-pre-wrap leading-relaxed">
            {summary}
          </pre>
        </div>
      )}
    </div>
  )
}
