import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// ── Zod schema for Claude's structured JSON response ─────────────────────────
export const ClassificationSchema = z.object({
  sentiment:      z.enum(['POS', 'NEU', 'NEG']),
  sentimentScore: z.number().min(-1).max(1),
  themes:         z.array(z.string()).max(3),
  summary:        z.string().max(200),
})

export type Classification = z.infer<typeof ClassificationSchema>

// ── Lazy singleton — only instantiated server-side ───────────────────────────
let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set')
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

const SYSTEM_PROMPT = `You are a customer-feedback classifier for a SaaS analytics platform.
Given a piece of customer feedback, return ONLY a JSON object with these exact fields:
- sentiment: "POS" | "NEU" | "NEG"
- sentimentScore: float from -1.0 (most negative) to 1.0 (most positive)
- themes: array of 1-3 strings chosen ONLY from: ["Performance","Onboarding","Billing","Mobile","Integrations","Feature Requests","Support","UX","Security","Analytics"]
- summary: one sentence max 200 chars summarising the core issue or praise

Respond with valid JSON only. No markdown fences, no explanation, no extra keys.`

// ── Call Claude and return a validated Classification ────────────────────────
export async function classifyFeedback(content: string): Promise<Classification> {
  const client = getClient()

  const message = await client.messages.create({
    model:      'claude-sonnet-4-5',
    max_tokens: 256,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: 'user', content }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error(`Claude returned non-JSON: ${raw.slice(0, 200)}`)
  }

  const result = ClassificationSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error(`Schema validation failed: ${JSON.stringify(result.error.flatten())}`)
  }

  return result.data
}

// ── Persist a classification result to the DB ────────────────────────────────
// Shared by: ingest (fire-and-forget), batch back-fill, manual re-classify.
// Overwrites existing sentiment/score/summary and re-links themes.
export async function persistClassification(
  feedbackId: string,
  workspaceId: string,
  cls: Classification
): Promise<void> {
  const { sentiment, sentimentScore, themes, summary } = cls

  // Resolve theme names → IDs scoped to this workspace
  const workspaceThemes = await prisma.theme.findMany({
    where: { workspaceId, name: { in: themes } },
    select: { id: true, name: true },
  })
  const themeIds = workspaceThemes.map(t => t.id)

  // Delete old theme links then re-create — handles re-classify cleanly
  await prisma.$transaction([
    prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        sentiment:      sentiment as never,
        sentimentScore,
        sourceRef:      summary,
      },
    }),
    prisma.feedbackTheme.deleteMany({ where: { feedbackId } }),
    ...themeIds.map(themeId =>
      prisma.feedbackTheme.create({
        data: { feedbackId, themeId, confidence: 0.9 },
      })
    ),
  ])
}

// ── Classify a batch sequentially (avoids rate-limit bursts) ─────────────────
export async function classifyBatch(
  items: { id: string; content: string }[]
): Promise<{ id: string; classification: Classification }[]> {
  const results: { id: string; classification: Classification }[] = []

  for (const item of items) {
    try {
      const classification = await classifyFeedback(item.content)
      results.push({ id: item.id, classification })
    } catch (err) {
      console.error(`[ai] classifyBatch skipping ${item.id}:`, err)
    }
  }

  return results
}
