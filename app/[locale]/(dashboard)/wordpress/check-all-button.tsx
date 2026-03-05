'use client'

// "Check All" button — triggers concurrent uptime check for all active sites

import { useTransition } from 'react'
import { checkAllSites } from './wp-actions'

interface CheckAllButtonProps {
  label: string
}

export function CheckAllButton({ label }: CheckAllButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await checkAllSites()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-[11px] font-semibold font-ui text-mod-wordpress
                 border border-mod-wordpress/20 rounded-lg px-2 py-0.5
                 disabled:opacity-50"
    >
      {isPending ? '…' : label}
    </button>
  )
}
