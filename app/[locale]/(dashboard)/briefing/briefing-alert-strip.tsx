// Domain health alerts strip — shows offline/warning WordPress sites
// Rendered server-side; renders nothing if all sites are healthy

import type { WordPressSite } from '@/lib/supabase/types'

interface Props {
  alerts: Pick<WordPressSite, 'name' | 'url' | 'last_status'>[]
}

const STATUS_LABEL: Record<string, string> = {
  offline: 'offline',
  warning: 'warning',
}

export function BriefingAlertStrip({ alerts }: Props) {
  if (alerts.length === 0) return null

  return (
    <div className="space-y-1.5">
      {alerts.map((site) => (
        <div
          key={site.url}
          className="flex items-center gap-2 px-3 py-2 rounded-xl
                     bg-[#F5564A]/10 border border-[#F5564A]/25"
        >
          {/* Pulsing dot */}
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5564A] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F5564A]" />
          </span>

          <p className="text-xs font-medium font-ui text-[#F5564A] leading-snug truncate">
            <span className="font-semibold">{site.name}</span>
            {' '}is{' '}
            <span>{STATUS_LABEL[site.last_status ?? ''] ?? site.last_status}</span>
          </p>

          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[10px] font-data text-[#F5564A]/70 flex-shrink-0 underline"
          >
            check
          </a>
        </div>
      ))}
    </div>
  )
}
