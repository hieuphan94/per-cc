'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'

interface Props {
  name?: string
  defaultValue?: string
  placeholder?: string
  onChange?: (html: string) => void
}

// Icon helpers — inline SVG to avoid icon library dependency
function Icon({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const BOLD_PATH    = 'M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5S13.83 9.5 13 9.5h-3V6.5zm3.5 9H10V13h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z'
const ITALIC_PATH  = 'M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z'
const UNDER_PATH   = 'M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z'
const STRIKE_PATH  = 'M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z'
const UL_PATH      = 'M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z'
const OL_PATH      = 'M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z'
const ALIGN_L_PATH = 'M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z'
const ALIGN_C_PATH = 'M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z'
const ALIGN_R_PATH = 'M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z'

export function RichTextEditor({ name, defaultValue = '', placeholder, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: defaultValue,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'min-h-[80px] p-3 text-sm text-text-primary font-ui focus:outline-none prose-dark',
      },
    },
  })

  if (!editor) return null

  function btn(active: boolean, onClick: () => void, title: string, iconD: string) {
    return (
      <button
        key={title}
        type="button"
        title={title}
        onClick={onClick}
        className={`p-1.5 rounded transition-colors ${
          active
            ? 'bg-bg-surface-3 text-accent'
            : 'text-text-muted hover:text-text-secondary hover:bg-bg-surface-3'
        }`}
      >
        <Icon d={iconD} />
      </button>
    )
  }

  return (
    <div className="w-full bg-bg-surface-2 border border-border-muted rounded-xl overflow-hidden
                    focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border-muted bg-bg-surface">
        {btn(editor.isActive('bold'),      () => editor.chain().focus().toggleBold().run(),      'Bold',    BOLD_PATH)}
        {btn(editor.isActive('italic'),    () => editor.chain().focus().toggleItalic().run(),    'Italic',  ITALIC_PATH)}
        {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'Underline', UNDER_PATH)}
        {btn(editor.isActive('strike'),    () => editor.chain().focus().toggleStrike().run(),    'Strike',  STRIKE_PATH)}

        <span className="w-px h-4 bg-border-muted mx-1" />

        {btn(editor.isActive('bulletList'),  () => editor.chain().focus().toggleBulletList().run(),  'Bullet list',  UL_PATH)}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Ordered list', OL_PATH)}

        <span className="w-px h-4 bg-border-muted mx-1" />

        {btn(editor.isActive({ textAlign: 'left' }),   () => editor.chain().focus().setTextAlign('left').run(),   'Align left',   ALIGN_L_PATH)}
        {btn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), 'Align center', ALIGN_C_PATH)}
        {btn(editor.isActive({ textAlign: 'right' }),  () => editor.chain().focus().setTextAlign('right').run(),  'Align right',  ALIGN_R_PATH)}
      </div>

      {/* Editor area */}
      <div className="relative">
        {editor.isEmpty && placeholder && (
          <p className="absolute top-3 left-3 text-sm text-text-muted font-ui pointer-events-none select-none">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>

      {/* Hidden input carries HTML value on form submit (only when name provided) */}
      {name && <input type="hidden" name={name} value={editor.getHTML()} />}
    </div>
  )
}
