'use client'

// Individual WordPress site card — shows status, domain expiry, check + delete actions

import { useState, useTransition } from 'react'
import { format, differenceInDays, parseISO } from 'date-fns'
import { checkSite, deleteSite } from './wp-actions'
import type { WordPressSite } from '@/lib/supabase/types'

type Site = Pick<
  WordPressSite,
  'id' | 'name' | 'url' | 'last_status' | 'last_checked_at' | 'domain_expiry_at'
>

const STATUS_COLOR: Record<string, string> = {
  online:  'bg-success',
  offline: 'bg-danger',
  warning: 'bg-warning',
}

const BADGE_COLOR: Record<string, string> = {
  online:  'bg-[#22D47A18] text-success',
  offline: 'bg-[#F5564A18] text-danger',
  warning: 'bg-[#F5A62318] text-warning',
}

// Domain expiry badge: red < 30d, yellow < 90d, green otherwise
function DomainExpiryBadge({ expiryDate }: { expiryDate: string }) {
  const days = differenceInDays(parseISO(expiryDate), new Date())
  const color =
    days < 0   ? 'bg-[#F5564A18] text-danger' :
    days < 30  ? 'bg-[#F5564A18] text-danger' :
    days < 90  ? 'bg-[#F5A62318] text-warning' :
                 'bg-[#22D47A18] text-success'
  const label = days < 0 ? 'expired' : `${days}d`
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full font-ui ${color}`}>
      {label}
    </span>
  )
}

interface SiteCardProps {
  site: Site
  labelCheck: string
  labelDelete: string
  labelLastChecked: string
  labelDomainExpiry: string
}

export function SiteCard({
  site,
  labelCheck,
  labelDelete,
  labelLastChecked,
  labelDomainExpiry,
}: SiteCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDelete]    = useTransition()
  const [localStatus, setLocalStatus] = useState(site.last_status)

  function handleCheck() {
    startTransition(async () => {
      const res = await checkSite(site.id)
      if (!res.error) setLocalStatus(res.status as WordPressSite['last_status'])
    })
  }

  function handleDelete() {
    if (!confirm(`Delete "${site.name}"?`)) return
    startDelete(async () => {
      await deleteSite(site.id)
    })
  }

  const dotColor  = localStatus ? (STATUS_COLOR[localStatus] ?? 'bg-text-muted') : 'bg-text-muted'
  const badgeCls  = localStatus ? (BADGE_COLOR[localStatus]  ?? 'bg-bg-surface-3 text-text-muted') : 'bg-bg-surface-3 text-text-muted'

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5 space-y-2">

      {/* Top row: dot, name, status badge */}
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary font-ui truncate">{site.name}</p>
          <p className="text-[11px] text-text-muted font-data truncate">{site.url}</p>
        </div>
        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui ${badgeCls}`}>
          {localStatus ?? 'unknown'}
        </span>
      </div>

      {/* Meta row: last checked + domain expiry */}
      <div className="flex items-center gap-3 flex-wrap">
        {site.last_checked_at && (
          <p className="text-[10px] text-text-muted font-data">
            {labelLastChecked}: {format(new Date(site.last_checked_at), 'HH:mm dd/MM')}
          </p>
        )}
        {site.domain_expiry_at && (
          <span className="flex items-center gap-1">
            <span className="text-[10px] text-text-muted font-data">{labelDomainExpiry}:</span>
            <DomainExpiryBadge expiryDate={site.domain_expiry_at} />
          </span>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={handleCheck}
          disabled={isPending}
          className="flex-1 text-[11px] font-semibold font-ui text-mod-wordpress
                     border border-mod-wordpress/30 rounded-lg py-1 disabled:opacity-50"
        >
          {isPending ? '…' : labelCheck}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-[11px] font-semibold font-ui text-danger
                     border border-danger/20 rounded-lg px-3 py-1 disabled:opacity-50"
        >
          {isDeleting ? '…' : labelDelete}
        </button>
      </div>

    </div>
  )
}
