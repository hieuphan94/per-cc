'use client'

// Manual task add form for Morning Briefing
// Priority selector: 1-5 pills, default 3

import { useRef, useState, useTransition } from 'react'
import { addTask } from './actions'

const PRIORITIES = [1, 2, 3, 4, 5] as const
const PRIORITY_LABELS: Record<number, string> = { 1: 'P1', 2: 'P2', 3: 'P3', 4: 'P4', 5: 'P5' }
const PRIORITY_COLORS: Record<number, string> = {
  1: '#F5564A', 2: '#F5A623', 3: '#3DD6F5', 4: '#8B9BB0', 5: '#4A5A6E',
}

export function BriefingAddForm() {
  const [priority, setPriority] = useState(3)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('priority', String(priority))

    startTransition(async () => {
      const result = await addTask(formData)
      if (result.error) {
        setError(result.error)
      } else {
        formRef.current?.reset()
        setPriority(3)
      }
    })
  }

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted font-ui">
        Add Task
      </p>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        {/* Title input */}
        <input
          name="title"
          type="text"
          required
          placeholder="Task title..."
          className="w-full bg-bg-surface-2 border border-border-muted rounded-xl px-3 py-2.5
                     text-sm font-ui text-text-primary placeholder:text-text-muted
                     focus:outline-none focus:border-accent transition-colors"
        />

        {/* Priority pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-ui flex-shrink-0">Priority:</span>
          <div className="flex gap-1.5">
            {PRIORITIES.map((p) => {
              const isSelected = priority === p
              const color = PRIORITY_COLORS[p]
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold font-ui transition-colors"
                  style={{
                    backgroundColor: isSelected ? `${color}30` : `${color}10`,
                    color: isSelected ? color : `${color}80`,
                    border: `1px solid ${isSelected ? color : 'transparent'}`,
                  }}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-[#F5564A] font-ui">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 rounded-xl bg-accent/10 border border-accent/30
                     text-sm font-semibold font-ui text-accent
                     disabled:opacity-50 active:bg-accent/20 transition-colors"
        >
          {isPending ? 'Adding...' : '+ Add Task'}
        </button>
      </form>
    </div>
  )
}
