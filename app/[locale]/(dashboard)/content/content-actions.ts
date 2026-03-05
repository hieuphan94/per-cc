'use server'

// Server actions for Content Pipeline module
// Handles: add idea, delete item, advance status, AI outline generation

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { generateContentOutline } from '@/lib/services/content-ai-service'
import type { ContentItem } from '@/lib/supabase/types'

function revalidateContent() {
  revalidatePath('/vi/content')
  revalidatePath('/en/content')
}

// Status pipeline: idea → outlined → drafted → published
const STATUS_NEXT: Record<ContentItem['status'], ContentItem['status'] | null> = {
  idea:      'outlined',
  outlined:  'drafted',
  drafted:   'published',
  published: null,
}

// Add a new content idea
export async function addContentItem(formData: FormData): Promise<{ error?: string }> {
  const title        = (formData.get('title')        as string | null)?.trim()
  const content_type = (formData.get('content_type') as string | null)
  const raw_idea     = (formData.get('raw_idea')     as string | null)?.trim() || null

  if (!title)        return { error: 'Title is required' }
  if (!content_type) return { error: 'Content type is required' }

  const VALID_TYPES = ['fb_post', 'blog', 'video_script'] as const
  if (!VALID_TYPES.includes(content_type as typeof VALID_TYPES[number])) {
    return { error: 'Invalid content type' }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('content_items').insert({
    title,
    content_type: content_type as ContentItem['content_type'],
    raw_idea,
  })

  if (error) return { error: error.message }
  revalidateContent()
  return {}
}

// Delete a content item
export async function deleteContentItem(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('content_items').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateContent()
  return {}
}

// Advance item to next status in pipeline
export async function advanceStatus(id: string, currentStatus: ContentItem['status']): Promise<{ error?: string }> {
  const nextStatus = STATUS_NEXT[currentStatus]
  if (!nextStatus) return {}  // already published

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('content_items')
    .update({ status: nextStatus })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidateContent()
  return {}
}

// Generate AI outline and store it, then advance status to 'outlined'
export async function generateOutline(id: string): Promise<{ outline?: string; error?: string }> {
  const supabase = createAdminClient()

  const { data: item } = await supabase
    .from('content_items')
    .select('title, content_type, raw_idea')
    .eq('id', id)
    .single()

  if (!item) return { error: 'Item not found' }

  try {
    const outline = await generateContentOutline(
      item.title,
      item.content_type as ContentItem['content_type'],
      item.raw_idea,
    )

    await supabase
      .from('content_items')
      .update({ ai_outline: outline, status: 'outlined' })
      .eq('id', id)

    revalidateContent()
    return { outline }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'AI generation failed' }
  }
}
