'use client'

// Add WordPress site form — slide-up drawer on mobile

import { useState, useTransition, useRef } from 'react'
import { addSite } from './wp-actions'

interface AddSiteFormProps {
  labelAdd: string
  labelName: string
  labelUrl: string
  labelDomainExpiry: string
  labelWpUser: string
  labelWpPassword: string
  labelSave: string
  labelCancel: string
  labelOptional: string
}

export function AddSiteForm({
  labelAdd,
  labelName,
  labelUrl,
  labelDomainExpiry,
  labelWpUser,
  labelWpPassword,
  labelSave,
  labelCancel,
  labelOptional,
}: AddSiteFormProps) {
  const [open, setOpen]         = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formRef.current) return
    const formData = new FormData(formRef.current)
    setError(null)
    startTransition(async () => {
      const res = await addSite(formData)
      if (res.error) {
        setError(res.error)
      } else {
        formRef.current?.reset()
        setOpen(false)
      }
    })
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] font-semibold font-ui text-mod-wordpress
                   border border-mod-wordpress/20 rounded-lg px-2 py-0.5"
      >
        + {labelAdd}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-bg-surface border-t border-border-subtle
                    rounded-t-2xl p-5 space-y-4 transition-transform duration-300
                    ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text-primary font-ui">+ {labelAdd}</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-text-muted text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          {/* Name */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelName}
            </label>
            <input
              name="name"
              required
              placeholder="My Site"
              className="mt-1 w-full bg-bg-base border border-border-subtle rounded-xl px-3 py-2
                         text-sm text-text-primary font-ui placeholder:text-text-muted
                         focus:outline-none focus:border-mod-wordpress"
            />
          </div>

          {/* URL */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelUrl}
            </label>
            <input
              name="url"
              required
              placeholder="https://example.com"
              className="mt-1 w-full bg-bg-base border border-border-subtle rounded-xl px-3 py-2
                         text-sm text-text-primary font-data placeholder:text-text-muted
                         focus:outline-none focus:border-mod-wordpress"
            />
          </div>

          {/* Domain expiry */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelDomainExpiry} <span className="normal-case font-normal">({labelOptional})</span>
            </label>
            <input
              name="domain_expiry_at"
              type="date"
              className="mt-1 w-full bg-bg-base border border-border-subtle rounded-xl px-3 py-2
                         text-sm text-text-primary font-data
                         focus:outline-none focus:border-mod-wordpress"
            />
          </div>

          {/* WP credentials (optional) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
                {labelWpUser}
              </label>
              <input
                name="wp_user"
                placeholder="admin"
                className="mt-1 w-full bg-bg-base border border-border-subtle rounded-xl px-3 py-2
                           text-sm text-text-primary font-ui placeholder:text-text-muted
                           focus:outline-none focus:border-mod-wordpress"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
                {labelWpPassword}
              </label>
              <input
                name="wp_app_password"
                type="password"
                placeholder="••••••"
                className="mt-1 w-full bg-bg-base border border-border-subtle rounded-xl px-3 py-2
                           text-sm text-text-primary font-ui placeholder:text-text-muted
                           focus:outline-none focus:border-mod-wordpress"
              />
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-danger font-ui">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle
                         text-sm font-semibold font-ui text-text-muted"
            >
              {labelCancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-mod-wordpress text-white
                         text-sm font-semibold font-ui disabled:opacity-60"
            >
              {isPending ? '…' : labelSave}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
