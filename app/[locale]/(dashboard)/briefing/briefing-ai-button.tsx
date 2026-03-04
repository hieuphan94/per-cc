'use client'

// AI Prioritize button — triggers gpt-4-mini scoring for today's tasks

import { useTransition, useState } from 'react'
import { aiPrioritize } from './actions'

interface Props {
  hasUnscoredTasks: boolean
}

export function BriefingAiButton({ hasUnscoredTasks }: Props) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  function handleClick() {
    setMessage(null)
    startTransition(async () => {
      const result = await aiPrioritize()
      if (result.error) {
        setMessage(`Error: ${result.error}`)
      } else {
        setMessage(result.scored > 0 ? `✓ Scored ${result.scored} tasks` : 'No tasks to score')
      }
      // Clear message after 3s
      setTimeout(() => setMessage(null), 3000)
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={isPending || !hasUnscoredTasks}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl
                   bg-[#A78BFA]/10 border border-[#A78BFA]/30
                   text-sm font-semibold font-ui text-[#A78BFA]
                   disabled:opacity-40 active:bg-[#A78BFA]/20 transition-colors"
      >
        <span>{isPending ? '⏳' : '✦'}</span>
        <span>{isPending ? 'Prioritizing...' : 'AI Prioritize'}</span>
      </button>

      {message && (
        <p className="text-[11px] font-ui text-text-secondary text-center">{message}</p>
      )}
    </div>
  )
}
