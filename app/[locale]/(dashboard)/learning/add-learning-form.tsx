'use client'

// Add learning entry form — slide-up drawer

import { useState, useTransition, useRef } from 'react'
import { addLearningEntry } from './learning-actions'

const TYPES = [
  { value: 'reading', label: '📖 Read' },
  { value: 'ai_tool', label: '🤖 AI' },
  { value: 'english', label: '🔤 EN' },
  { value: 'other',   label: '💡 Other' },
] as const

interface AddLearningFormProps {
  labelAdd: string
  labelTitle: string
  labelType: string
  labelSource: string
  labelNotes: string
  labelSave: string
  labelCancel: string
  labelOptional: string
}

export function AddLearningForm({
  labelAdd, labelTitle, labelType, labelSource, labelNotes,
  labelSave, labelCancel, labelOptional,
}: AddLearningFormProps) {
  const [open, setOpen]              = useState(false)
  const [selectedType, setType]      = useState<string>('reading')
  const [error, setError]            = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef                      = useRef<HTMLFormElement>(null)

  const today = new Date().toISOString().slice(0, 10)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formRef.current) return
    setError(null)
    const formData = new FormData(formRef.current)
    startTransition(async () => {
      const res = await addLearningEntry(formData)
      if (res.error) { setError(res.error) }
      else { formRef.current?.reset(); setType('reading'); setOpen(false) }
    })
  }

  const inputCls = `mt-1 w-full bg-bg-base border border-border-subtle rounded-xl px-3 py-2
                    text-sm text-text-primary font-ui placeholder:text-text-muted
                    focus:outline-none focus:border-mod-learning`

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] font-semibold font-ui text-mod-learning
                   border border-mod-learning/20 rounded-lg px-2 py-0.5"
      >
        + {labelAdd}
      </button>

      {open && <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />}

      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-bg-surface border-t border-border-subtle
                       rounded-t-2xl p-5 transition-transform duration-300
                       ${open ? 'translate-y-0' : 'translate-y-full'}`}>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-text-primary font-ui">+ {labelAdd}</p>
          <button type="button" onClick={() => setOpen(false)} className="text-text-muted text-lg">✕</button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="entry_date" value={today} />

          {/* Type segmented */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelType}
            </label>
            <div className="flex gap-1 mt-1 bg-bg-base border border-border-subtle rounded-xl p-1">
              {TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex-1 py-1.5 text-[10px] font-semibold font-ui rounded-lg transition-colors ${
                    selectedType === value
                      ? 'bg-mod-learning/20 text-mod-learning'
                      : 'text-text-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input type="hidden" name="entry_type" value={selectedType} />
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelTitle}
            </label>
            <input name="title" required placeholder="What did you learn?" className={inputCls} />
          </div>

          {/* Source */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelSource} <span className="normal-case font-normal">({labelOptional})</span>
            </label>
            <input name="source" placeholder="Book, URL, course…" className={inputCls} />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelNotes} <span className="normal-case font-normal">({labelOptional})</span>
            </label>
            <textarea name="notes" rows={2} placeholder="Key takeaways…" className={`${inputCls} resize-none`} />
          </div>

          {error && <p className="text-[11px] text-danger font-ui">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-semibold font-ui text-text-muted"
            >
              {labelCancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-mod-learning text-white text-sm font-semibold font-ui disabled:opacity-60"
            >
              {isPending ? '…' : labelSave}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
