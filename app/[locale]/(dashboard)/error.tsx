'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// Dashboard error boundary — must be 'use client'
export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('[Dashboard Error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 space-y-4">
      {/* Danger dot */}
      <span className="inline-flex rounded-full h-3 w-3 bg-danger" />

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-text-primary font-ui">
          Something went wrong
        </p>
        <p className="text-xs text-text-secondary font-ui max-w-[240px]">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>

      <button
        onClick={reset}
        className="bg-accent text-bg-base font-semibold text-sm rounded-xl py-2.5 px-6
                   font-ui active:scale-[0.98] transition-transform duration-100"
      >
        Retry
      </button>
    </div>
  )
}
