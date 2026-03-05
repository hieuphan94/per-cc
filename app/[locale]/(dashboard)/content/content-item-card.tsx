'use client'

// Content item card — shows status, type badges, AI outline button, expand/delete

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { deleteContentItem, advanceStatus, generateOutline } from './content-actions'
import type { ContentItem } from '@/lib/supabase/types'

type ItemRow = Pick<
  ContentItem,
  'id' | 'title' | 'content_type' | 'status' | 'scheduled_for' | 'ai_outline' | 'raw_idea'
>

const STATUS_STYLES: Record<string, string> = {
  idea:      'bg-[#3DD6F518] text-accent',
  outlined:  'bg-[#A78BFA18] text-purple-400',
  drafted:   'bg-[#F472B618] text-mod-content',
  published: 'bg-[#22D47A18] text-success',
}

const TYPE_LABELS: Record<string, string> = {
  fb_post: 'FB', blog: 'Blog', video_script: 'Video',
}

const STATUS_NEXT_LABEL: Record<string, string> = {
  idea: '→ Outline', outlined: '→ Draft', drafted: '→ Publish',
}

interface ContentItemCardProps {
  item: ItemRow
  labelGenerate: string
  labelDelete: string
  labelAdvance: string
}

export function ContentItemCard({ item, labelGenerate, labelDelete }: ContentItemCardProps) {
  const [expanded, setExpanded]      = useState(false)
  const [outline, setOutline]        = useState(item.ai_outline)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDelete]    = useTransition()
  const [isAdvancing, startAdvance]  = useTransition()
  const [genError, setGenError]      = useState<string | null>(null)

  function handleGenerate() {
    setGenError(null)
    startTransition(async () => {
      const res = await generateOutline(item.id)
      if (res.error) setGenError(res.error)
      else if (res.outline) { setOutline(res.outline); setExpanded(true) }
    })
  }

  function handleAdvance() {
    startAdvance(async () => { await advanceStatus(item.id, item.status) })
  }

  function handleDelete() {
    if (!confirm(`Delete "${item.title}"?`)) return
    startDelete(async () => { await deleteContentItem(item.id) })
  }

  const typeBadge = `text-[9px] font-bold px-1.5 py-0.5 rounded-full font-ui uppercase
    ${item.content_type === 'fb_post'      ? 'bg-[#3DD6F518] text-accent'    :
      item.content_type === 'blog'         ? 'bg-[#A78BFA18] text-purple-400' :
                                             'bg-[#F5A62318] text-warning'}`

  const nextLabel = STATUS_NEXT_LABEL[item.status]

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-3.5 space-y-2">

      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary font-ui leading-snug">{item.title}</p>
          {item.scheduled_for && (
            <p className="text-[10px] text-text-muted font-data mt-0.5">
              {format(new Date(item.scheduled_for), 'dd/MM/yyyy')}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={typeBadge}>{TYPE_LABELS[item.content_type] ?? item.content_type}</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full font-ui uppercase ${
            STATUS_STYLES[item.status] ?? 'bg-bg-surface-3 text-text-muted'
          }`}>
            {item.status}
          </span>
        </div>
      </div>

      {/* Expand outline */}
      {outline && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="text-[10px] text-mod-content font-ui"
          >
            {expanded ? '▲ hide outline' : '▼ view outline'}
          </button>
          {expanded && (
            <pre className="mt-1 text-[10px] text-text-muted font-data leading-relaxed whitespace-pre-wrap break-words">
              {outline}
            </pre>
          )}
        </div>
      )}

      {genError && <p className="text-[10px] text-danger font-ui">{genError}</p>}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* AI generate (only for idea status without outline) */}
        {item.status === 'idea' && !outline && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending}
            className="flex-1 text-[11px] font-semibold font-ui text-accent
                       border border-accent/20 rounded-lg py-1 disabled:opacity-50"
          >
            {isPending ? '…' : `✦ ${labelGenerate}`}
          </button>
        )}

        {/* Advance status */}
        {nextLabel && (
          <button
            type="button"
            onClick={handleAdvance}
            disabled={isAdvancing}
            className="flex-1 text-[11px] font-semibold font-ui text-mod-content
                       border border-mod-content/20 rounded-lg py-1 disabled:opacity-50"
          >
            {isAdvancing ? '…' : nextLabel}
          </button>
        )}

        {/* Delete */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-[10px] font-semibold font-ui text-danger/70
                     border border-danger/15 rounded-lg px-2.5 py-1 disabled:opacity-50"
        >
          {isDeleting ? '…' : labelDelete}
        </button>
      </div>

    </div>
  )
}
