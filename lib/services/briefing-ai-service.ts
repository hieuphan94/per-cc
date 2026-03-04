// AI prioritization for Morning Briefing tasks using gpt-4-mini via Vercel AI SDK
// Sends today's task list → returns ranked scores + one-line notes per task

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

export interface TaskInput {
  id: string
  title: string
  priority: number  // user-set priority 1-5
}

export interface TaskRanking {
  id: string
  ai_score: number  // 1-10, higher = more urgent/important
  ai_note: string
}

const RankingsSchema = z.object({
  rankings: z.array(z.object({
    id: z.string(),
    score: z.number().int().min(1).max(10),
    note: z.string(),
  })),
})

// Limit to 20 tasks per AI call to keep cost + latency low
const MAX_TASKS = 20

export async function prioritizeTasks(tasks: TaskInput[]): Promise<TaskRanking[]> {
  if (tasks.length === 0) return []

  const limited = tasks.slice(0, MAX_TASKS)
  const taskList = limited.map(t =>
    `- id: ${t.id} | "${t.title}" (user priority: ${t.priority}/5)`
  ).join('\n')

  const prompt = `Given these tasks for today, assign each a priority score (1=lowest, 10=highest) based on urgency and importance. Reply with valid JSON only, no markdown.

Tasks:
${taskList}

Reply format:
{"rankings":[{"id":"<id>","score":<1-10>,"note":"<one sentence why>"}]}`

  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: 'You are a personal productivity assistant. Be concise and practical.',
      prompt,
      maxOutputTokens: 1000,
    })

    // Strip any accidental markdown code fences
    const cleaned = text.replace(/```(?:json)?|```/g, '').trim()
    const parsed = RankingsSchema.parse(JSON.parse(cleaned))

    return parsed.rankings.map(r => ({
      id: r.id,
      ai_score: r.score,
      ai_note: r.note,
    }))
  } catch (err) {
    console.error('[briefing-ai] prioritizeTasks failed:', err)
    return []
  }
}
