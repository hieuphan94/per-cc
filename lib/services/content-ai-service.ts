// AI outline/draft generation for Content Pipeline using gpt-4-mini via Vercel AI SDK
// Input: content title + type + raw idea → Output: structured outline text

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

type ContentType = 'fb_post' | 'blog' | 'video_script'

const TYPE_INSTRUCTIONS: Record<ContentType, string> = {
  fb_post:
    'Write a concise Facebook post outline with: hook (1 sentence), 2-3 key points, call to action.',
  blog:
    'Write a blog post outline with: headline, intro paragraph summary, 3-5 H2 sections with bullet points, conclusion.',
  video_script:
    'Write a video script outline with: hook (5s), intro (15s), 3-4 main segments with talking points, outro/CTA.',
}

// Generate an AI outline for a content idea. Returns the outline as markdown text.
export async function generateContentOutline(
  title: string,
  contentType: ContentType,
  rawIdea: string | null,
): Promise<string> {
  const typeGuide = TYPE_INSTRUCTIONS[contentType]
  const ideaContext = rawIdea ? `\n\nAdditional context: ${rawIdea}` : ''

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are a content strategist. Generate a clear, actionable outline. Be concise.`,
    prompt: `Content title: "${title}"
Content type: ${contentType}
Task: ${typeGuide}${ideaContext}

Respond with the outline in markdown format only.`,
    temperature: 0.4,
  })

  return text.trim()
}
