import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

// ── Zod schema for Claude's structured JSON response ──────────────────────────
export const ClassificationSchema = z.object({
  sentiment:      z.enum(['POS', 'NEU', 'NEG']),
  sentimentScore: z.number().min(-1).max(1),
  themes:         z.array(z.string()).max(3),
  summary:        z.string().max(200),
})

export type Classification = z.infer<typeof ClassificationSchema>

// ── Lazy singleton — only instantiated on the server ──────────────────────────
let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set')
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

const SYSTEM_PROMPT = `You are a customer-feedback classifier for a SaaS analytics platform.
Given a piece of customer feedback, return ONLY a JSON object with these fields:
- sentiment: "POS" | "NEU" | "NEG"
- sentimentScore: float from -1.0 (most negative) to 1.0 (most positive)
- themes: array of 1-3 theme strings from this list: ["Performance", "Onboarding", "Billing", "Mobile", "Integrations", "Feature Requests", "Support", "UX", "Security", "Analytics"]
- summary: one sentence (max 200 chars) summarising the feedback

Respond with valid JSON only. No markdown, no explanation.`

// ── Classify a single feedback string ─────────────────────────────────────────
export async function classifyFeedback(content: string): Promise<Classification> {
  const client = getClient()

  const message = await client.messages.create({
    model:      'claude-sonnet-4-5',
    max_tokens: 256,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: 'user', content }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  // Strip markdown code fences if Claude wraps the JSON
  const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error(`Claude returned non-JSON: ${raw.slice(0, 200)}`)
  }

  const result = ClassificationSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error(`Classification schema invalid: ${JSON.stringify(result.error.flatten())}`)
  }

  return result.data
}

// ── Classify a batch, returning results keyed by index ────────────────────────
// Processes sequentially to avoid rate-limit bursts.
export async function classifyBatch(
  items: { id: string; content: string }[]
): Promise<{ id: string; classification: Classification }[]> {
  const results: { id: string; classification: Classification }[] = []

  for (const item of items) {
    try {
      const classification = await classifyFeedback(item.content)
      results.push({ id: item.id, classification })
    } catch (err) {
      // Log and skip — don't let one bad item abort the whole batch
      console.error(`[ai] Failed to classify ${item.id}:`, err)
    }
  }

  return results
}
