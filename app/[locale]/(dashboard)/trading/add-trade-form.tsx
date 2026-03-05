'use client'

// Add trade form — slide-up drawer for logging a new trade entry

import { useState, useTransition, useRef } from 'react'
import { addEntry } from './trading-actions'

const SESSIONS   = ['morning', 'afternoon', 'evening'] as const
const DIRECTIONS = ['long', 'short'] as const
const RESULTS    = ['win', 'loss', 'breakeven'] as const

interface AddTradeFormProps {
  labelAdd: string
  labelDate: string
  labelSession: string
  labelMarket: string
  labelDirection: string
  labelEntryPrice: string
  labelExitPrice: string
  labelLotSize: string
  labelPnl: string
  labelResult: string
  labelNotes: string
  labelSave: string
  labelCancel: string
  labelOptional: string
}

export function AddTradeForm(props: AddTradeFormProps) {
  const {
    labelAdd, labelDate, labelSession, labelMarket, labelDirection,
    labelEntryPrice, labelExitPrice, labelLotSize, labelPnl,
    labelResult, labelNotes, labelSave, labelCancel, labelOptional,
  } = props

  const [open, setOpen]              = useState(false)
  const [error, setError]            = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef                      = useRef<HTMLFormElement>(null)

  // Today's date as default
  const today = new Date().toISOString().slice(0, 10)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formRef.current) return
    setError(null)
    const formData = new FormData(formRef.current)
    startTransition(async () => {
      const res = await addEntry(formData)
      if (res.error) {
        setError(res.error)
      } else {
        formRef.current?.reset()
        setOpen(false)
      }
    })
  }

  const inputCls = `mt-1 w-full bg-bg-base border border-border-subtle rounded-xl px-3 py-2
                    text-sm text-text-primary font-ui placeholder:text-text-muted
                    focus:outline-none focus:border-mod-trading`

  const segmentBase = `flex-1 py-1.5 text-[11px] font-semibold font-ui rounded-lg transition-colors`

  function SegmentGroup<T extends string>({
    name, values, required,
  }: { name: string; values: readonly T[]; required?: boolean }) {
    const [selected, setSelected] = useState<T | ''>('')
    return (
      <div className="flex gap-1 mt-1 bg-bg-base border border-border-subtle rounded-xl p-1">
        {!required && (
          <button type="button" onClick={() => setSelected('')}
            className={`${segmentBase} ${selected === '' ? 'bg-bg-surface text-text-primary' : 'text-text-muted'}`}>
            —
          </button>
        )}
        {values.map((v) => (
          <button
            key={v} type="button"
            onClick={() => setSelected(v)}
            className={`${segmentBase} capitalize ${
              selected === v ? 'bg-mod-trading/20 text-mod-trading' : 'text-text-muted'
            }`}
          >
            {v}
          </button>
        ))}
        {/* Hidden input carries the value */}
        <input type="hidden" name={name} value={selected} />
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] font-semibold font-ui text-mod-trading
                   border border-mod-trading/20 rounded-lg px-2 py-0.5"
      >
        + {labelAdd}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
      )}

      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-bg-surface border-t border-border-subtle
                       rounded-t-2xl p-5 transition-transform duration-300 max-h-[90vh] overflow-y-auto
                       ${open ? 'translate-y-0' : 'translate-y-full'}`}>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-text-primary font-ui">+ {labelAdd}</p>
          <button type="button" onClick={() => setOpen(false)} className="text-text-muted text-lg">✕</button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">

          {/* Date */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelDate}
            </label>
            <input name="entry_date" type="date" defaultValue={today} className={inputCls} />
          </div>

          {/* Session */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelSession} <span className="normal-case font-normal">({labelOptional})</span>
            </label>
            <SegmentGroup name="session" values={SESSIONS} />
          </div>

          {/* Market + Direction */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
                {labelMarket}
              </label>
              <input name="market" placeholder="XAUUSD" className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
                {labelDirection}
              </label>
              <SegmentGroup name="direction" values={DIRECTIONS} />
            </div>
          </div>

          {/* Prices + Lot */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'entry_price', label: labelEntryPrice, placeholder: '0.00' },
              { name: 'exit_price',  label: labelExitPrice,  placeholder: '0.00' },
              { name: 'lot_size',    label: labelLotSize,    placeholder: '0.01' },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
                  {label}
                </label>
                <input name={name} type="number" step="any" placeholder={placeholder} className={inputCls} />
              </div>
            ))}
          </div>

          {/* PnL */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelPnl} (USD)
            </label>
            <input name="pnl" type="number" step="any" placeholder="0.00" className={inputCls} />
          </div>

          {/* Result (required) */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelResult} *
            </label>
            <SegmentGroup name="result" values={RESULTS} required />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted font-ui uppercase tracking-wider">
              {labelNotes} <span className="normal-case font-normal">({labelOptional})</span>
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {error && <p className="text-[11px] text-danger font-ui">{error}</p>}

          <div className="flex gap-2 pt-1 pb-4">
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
              className="flex-1 py-2.5 rounded-xl bg-mod-trading text-white
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
