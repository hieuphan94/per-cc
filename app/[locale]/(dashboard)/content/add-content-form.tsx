'use client'

// Add content idea form — slide-up drawer

import { useState, useTransition, useRef } from 'react'
import { addContentItem } from './content-actions'

const TYPES = [
  { value: 'fb_post',      label: 'FB Post' },
  { value: 'blog',         label: 'Blog' },
  { value: 'video_script', label: 'Video' },
] as const

interface AddContentFormProps {
  labelAdd: string
  labelTitle: string
  labelType: string
  labelIdea: string
  labelSave: string
  labelCancel: string
  labelOptional: string
}

export function AddContentForm({
  labelAdd, labelTitle, labelType, labelIdea, labelSave, labelCancel, labelOptional,
}: AddContentFormProps) {
  const [open, setOpen]              = useState(false)
  const [selectedType, setType]      = useState<string>('fb_post')
  const [error, setError]            = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef                      = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formRef.current) return
    setError(null)
    const formData = new FormData(formRef.current)
    startTransition(async () => {
      const res = await addContentItem(formData)
      if (res.error) { setError(res.error) }
      else { formRef.current?.reset(); setOpen(false) }
    })
  }

  const inputCls = `mt-1 w-full bg-bg-base border border-border-subtle rounded-xl px-3 py-2
                    text-sm text-text-primary font-ui placeholder:text-text-muted
                    focus:outline-none focus:border-mod-content`

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] font-semibold font-ui text-mod-content
                   border border-mod-content/20 rounded-lg px-2 py-0.5"
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

          {/* Title */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelTitle}
            </label>
            <input name="title" required placeholder="My content idea…" className={inputCls} />
          </div>

          {/* Type segmented control */}
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
                  className={`flex-1 py-1.5 text-[11px] font-semibold font-ui rounded-lg transition-colors ${
                    selectedType === value
                      ? 'bg-mod-content/20 text-mod-content'
                      : 'text-text-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input type="hidden" name="content_type" value={selectedType} />
          </div>

          {/* Raw idea */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelIdea} <span className="normal-case font-normal">({labelOptional})</span>
            </label>
            <textarea
              name="raw_idea"
              rows={3}
              placeholder="Describe your idea for better AI outline…"
              className={`${inputCls} resize-none`}
            />
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
              className="flex-1 py-2.5 rounded-xl bg-mod-content text-white text-sm font-semibold font-ui disabled:opacity-60"
            >
              {isPending ? '…' : labelSave}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
