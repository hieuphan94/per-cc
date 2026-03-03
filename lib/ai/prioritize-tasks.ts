// AI task prioritization — server-side only
// Uses OpenAI gpt-4o-mini via Vercel AI SDK to rank today's tasks
// and produce a one-sentence focus summary

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import type { SheetTask } from '@/lib/google-sheets'

export interface RankedTask extends SheetTask {
  aiPriority: number       // 1 = highest
  aiReason: string | null
}

export interface PrioritizeResult {
  summary: string          // e.g. "Focus on X today — it unblocks Y."
  tasks: RankedTask[]
}

const SYSTEM_PROMPT = `You are a personal productivity assistant.
Given a list of tasks, return ONLY valid JSON with this exact shape:
{
  "summary": "One sentence: what to focus on today and why.",
  "tasks": [
    { "rowId": "<id>", "priority": 1, "reason": "short reason" }
  ]
}
Rules:
- priority 1 = highest importance; assign unique integers starting from 1
- Keep summary under 120 characters
- Keep reason under 60 characters
- Respond ONLY with the JSON object, no markdown fences`

export async function prioritizeTasks(tasks: SheetTask[]): Promise<PrioritizeResult> {
  // Return gracefully if no tasks or API key missing
  if (tasks.length === 0) return { summary: '', tasks: [] }
  if (!process.env.OPENAI_API_KEY) {
    return { summary: '', tasks: tasks.map((t, i) => ({ ...t, aiPriority: i + 1, aiReason: null })) }
  }

  const taskList = tasks.map((t) => `- [${t.rowId}] ${t.title}${t.notes ? ` (${t.notes})` : ''}`).join('\n')

  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: `Tasks for today:\n${taskList}` },
      ],
    })

    const parsed = JSON.parse(text) as {
      summary: string
      tasks: Array<{ rowId: string; priority: number; reason: string }>
    }

    // Merge AI priorities back into the original task objects
    const priorityMap = new Map(parsed.tasks.map((t) => [t.rowId, t]))

    const ranked: RankedTask[] = tasks.map((task, i) => {
      const ai = priorityMap.get(task.rowId)
      return {
        ...task,
        aiPriority: ai?.priority ?? i + 1,
        aiReason:   ai?.reason   ?? null,
      }
    })

    ranked.sort((a, b) => a.aiPriority - b.aiPriority)

    return { summary: parsed.summary ?? '', tasks: ranked }
  } catch {
    // Fallback: original order, no summary
    return { summary: '', tasks: tasks.map((t, i) => ({ ...t, aiPriority: i + 1, aiReason: null })) }
  }
}
