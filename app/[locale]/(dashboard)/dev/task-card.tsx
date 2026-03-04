'use client'

import { useState, useTransition } from 'react'
import { format, isToday, isPast, parseISO } from 'date-fns'
import { cycleTaskStatus, deleteDevTask, updateDevTask } from './dev-actions'
import { RichTextEditor } from './rich-text-editor'
import type { DevTask } from '@/lib/supabase/types'

type TaskRow = Pick<DevTask, 'id' | 'title' | 'status' | 'priority' | 'description' | 'project' | 'due_date'>

const PRIORITY_STYLES: Record<string, string> = {
  high:   'bg-[#F5564A18] text-danger',
  medium: 'bg-[#F5A62318] text-warning',
  low:    'bg-[#22D47A18] text-success',
}

const STATUS_STYLES: Record<string, string> = {
  in_progress: 'bg-[#A78BFA18] text-purple',
  todo:        'bg-[#3DD6F518] text-accent',
  blocked:     'bg-[#F5564A18] text-danger',
  done:        'bg-[#22D47A18] text-success',
}

// Returns color class for due date badge based on overdue/today/future
function dueDateStyle(due: string): string {
  const d = parseISO(due)
  if (isPast(d) && !isToday(d)) return 'bg-[#F5564A18] text-danger'
  if (isToday(d)) return 'bg-[#F5A62318] text-warning'
  return 'bg-bg-surface-3 text-text-muted'
}

// Status badge click: todo → in_progress → done (moves to history)
// Pencil icon reveals inline edit with title, description (rich text), project, due_date
export function TaskCard({ task }: { task: TaskRow }) {
  const [pending, startTransition] = useTransition()
  const [editing, setEditing]     = useState(false)
  const [title, setTitle]         = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [project, setProject]     = useState(task.project ?? '')
  const [dueDate, setDueDate]     = useState(task.due_date ?? '')

  function handleStatusClick() {
    startTransition(async () => { await cycleTaskStatus(task.id, task.status) })
  }

  function handleDelete() {
    startTransition(async () => { await deleteDevTask(task.id) })
  }

  function handleSave() {
    if (!title.trim()) return
    startTransition(async () => {
      await updateDevTask(task.id, title, description || null, project || null, dueDate || null)
      setEditing(false)
    })
  }

  function handleCancel() {
    setTitle(task.title)
    setDescription(task.description ?? '')
    setProject(task.project ?? '')
    setDueDate(task.due_date ?? '')
    setEditing(false)
  }

  // Edit mode
  if (editing) {
    return (
      <div className="bg-bg-surface border border-accent/40 rounded-2xl p-3.5 space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="w-full bg-bg-surface-2 border border-border-muted rounded-xl px-3 py-2
                     text-sm text-text-primary font-ui
                     focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
        />
        <RichTextEditor
          defaultValue={description}
          placeholder="Description (optional)"
          onChange={(html) => setDescription(html)}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="Project (optional)"
            className="bg-bg-surface-2 border border-border-muted rounded-xl px-3 py-2
                       text-sm text-text-primary placeholder-text-muted font-ui
                       focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-bg-surface-2 border border-border-muted rounded-xl px-3 py-2
                       text-sm text-text-primary font-ui focus:outline-none focus:border-accent
                       focus:ring-1 focus:ring-accent/30 [color-scheme:dark]"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={pending || !title.trim()}
            className="px-3 py-1.5 bg-accent text-bg-base text-xs font-semibold rounded-lg font-ui
                       disabled:opacity-40 active:scale-95 transition-transform"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 bg-bg-surface-3 text-text-muted text-xs rounded-lg font-ui"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // View mode
  return (
    <div className="group bg-bg-surface border border-border-subtle rounded-2xl p-3.5 flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium font-ui text-text-primary">{task.title}</p>
        {task.description && task.description !== '<p></p>' && (
          <div
            className="text-xs text-text-muted font-ui mt-0.5 prose-dark line-clamp-3"
            dangerouslySetInnerHTML={{ __html: task.description }}
          />
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
        {/* Edit — visible on hover */}
        <button
          type="button"
          onClick={() => setEditing(true)}
          title="Edit task"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150
                     w-5 h-5 flex items-center justify-center rounded-md
                     text-text-muted hover:text-accent hover:bg-[#3DD6F518] text-xs"
        >
          ✎
        </button>
        {/* Delete — visible on hover */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          title="Delete task"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150
                     w-5 h-5 flex items-center justify-center rounded-md
                     text-text-muted hover:text-danger hover:bg-[#F5564A18]
                     text-xs font-bold disabled:opacity-30"
        >
          ✕
        </button>

        {/* Due date badge */}
        {task.due_date && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full font-data
                           ${dueDateStyle(task.due_date)}`}>
            {isToday(parseISO(task.due_date)) ? 'Today' : format(parseISO(task.due_date), 'dd/MM')}
          </span>
        )}

        {task.priority && (
          <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui
                           ${PRIORITY_STYLES[task.priority] ?? 'bg-bg-surface-3 text-text-muted'}`}>
            {task.priority}
          </span>
        )}

        {/* Status badge — cycles todo → in_progress → done */}
        <button
          type="button"
          onClick={handleStatusClick}
          disabled={pending}
          title="Tap to advance status"
          className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full font-ui
                      ${STATUS_STYLES[task.status] ?? 'bg-bg-surface-3 text-text-muted'}
                      ${pending ? 'opacity-50' : 'active:scale-95 transition-transform cursor-pointer'}`}
        >
          {task.status.replace('_', ' ')}
        </button>
      </div>
    </div>
  )
}
