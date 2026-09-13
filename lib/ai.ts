import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// ── Zod schema for Claude's structured JSON response ─────────────────────────
export const ClassificationSchema = z.object({
  sentiment: z.enum(['POS', 'NEU', 'NEG']),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()).min(1).max(3),
  summary: z.string().max(200),
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

function buildSystemPrompt(existingThemes: string[]): string {
  const themeList = existingThemes.length > 0
    ? existingThemes.map(t => `"${t}"`).join(', ')
    : '"Performance","Onboarding","Billing","Mobile","Integrations","Feature Requests","Support","UX","Security","Analytics"'

  return `You are a customer-feedback classifier for a SaaS analytics platform.
Given a piece of customer feedback, return ONLY a JSON object with these exact fields:
- sentiment: "POS" | "NEU" | "NEG"
- sentimentScore: float from -1.0 (most negative) to 1.0 (most positive)
- themes: array of 1-3 theme strings. PREFER existing themes: [${themeList}]. Only invent a new theme name if none of the existing ones fit.
- summary: one sentence max 200 chars summarising the core issue or praise

Respond with valid JSON only. No markdown fences, no explanation, no extra keys.`
}

// ── Fetch existing theme names for a workspace (for prompt injection) ─────────
export async function getWorkspaceThemeNames(workspaceId: string): Promise<string[]> {
  const themes = await prisma.theme.findMany({
    where: { workspaceId },
    select: { name: true },
    orderBy: { name: 'asc' },
  })
  return themes.map(t => t.name)
}

// ── Call Claude and return a validated Classification ────────────────────────
export async function classifyFeedback(
  content: string,
  existingThemes: string[] = []
): Promise<Classification> {
  const client = getClient()

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 256,
    system: buildSystemPrompt(existingThemes),
    messages: [{ role: 'user', content }],
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
// Shared by: ingest, batch back-fill, manual re-classify.
// - Reuses existing themes by name (case-insensitive).
// - Auto-creates any theme name Claude returned that doesn't exist yet.
// - Deletes old FeedbackTheme links and re-creates — handles re-classify cleanly.
export async function persistClassification(
  feedbackId: string,
  workspaceId: string,
  cls: Classification
): Promise<void> {
  const { sentiment, sentimentScore, themes, summary } = cls

  // Resolve or create each theme name within this workspace
  const themeIds: string[] = []
  for (const name of themes) {
    const existing = await prisma.theme.findFirst({
      where: { workspaceId, name: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    })
    if (existing) {
      themeIds.push(existing.id)
    } else {
      // Auto-create unknown theme returned by Claude
      const created = await prisma.theme.create({
        data: { name, workspaceId },
        select: { id: true },
      })
      themeIds.push(created.id)
    }
  }

  // Update feedback + replace theme links atomically
  await prisma.$transaction([
    prisma.feedback.update({
      where: { id: feedbackId },
      data: { sentiment: sentiment as never, sentimentScore, sourceRef: summary },
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
  items: { id: string; content: string }[],
  existingThemes: string[] = []
): Promise<{ id: string; classification: Classification }[]> {
  const results: { id: string; classification: Classification }[] = []

  for (const item of items) {
    try {
      const classification = await classifyFeedback(item.content, existingThemes)
      results.push({ id: item.id, classification })
    } catch (err) {
      console.error(`[ai] classifyBatch skipping ${item.id}:`, err)
    }
  }

  return results
}

// ── Embedding helpers (uses OpenAI embeddings REST API) ────────────────────
function sqlEscapeString(s: string) {
  return s.replace(/'/g, "''")
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set')

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`OpenAI embedding error: ${res.status} ${txt}`)
  }

  const body = await res.json()
  const vec = body.data?.[0]?.embedding
  if (!Array.isArray(vec)) throw new Error('Invalid embedding response')
  return vec.map((n: number) => Number(n))
}

export async function persistEmbeddingForFeedback(feedbackId: string, vector: number[]): Promise<void> {
  // Safely build a literal for pgvector: '[0.1,0.2,...]'::vector
  const v = vector.map((n) => Number(n))
  const vecLiteral = `[${v.join(',')}]`
  const escFeedbackId = sqlEscapeString(feedbackId)

  // Upsert the embedding using raw SQL because Prisma doesn't natively support the pgvector type
  const sql = `INSERT INTO \"Embedding\" (\"feedbackId\", vector) VALUES ('${escFeedbackId}', '${vecLiteral}'::vector) ON CONFLICT (\"feedbackId\") DO UPDATE SET vector = EXCLUDED.vector;`
  await prisma.$executeRawUnsafe(sql)
}

export async function generateAndSaveEmbedding(feedbackId: string, text: string): Promise<void> {
  try {
    const vec = await generateEmbedding(text)
    await persistEmbeddingForFeedback(feedbackId, vec)
  } catch (err) {
    console.error('[ai] generateAndSaveEmbedding failed:', err)
  }
}

// ── Ask Claude with supplied evidence (grounded RAG) ───────────────────────
export async function askWithEvidence(question: string, evidences: { id: string; content: string }[]): Promise<string> {
  const client = getClient()

  const numbered = evidences.map((e, i) => `[${i + 1}] Feedback ${e.id}: ${e.content}`).join('\n')

  const system = `You are an analyst that MUST answer using only the supplied feedback items. Do not hallucinate or add external information. Produce a short concise answer, then a Sources section that lists the numbered feedback items referenced.`

  const userPrompt = `USER QUESTION:\n${question}\n\nRELEVANT FEEDBACK:\n${numbered}\n\nInstructions: Answer the user's question using ONLY the feedback above. Where you make a claim, cite the feedback items in brackets (e.g. [1], [2]). Then include a final "Sources" list mapping numbers to the original feedback text.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 512,
    system,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  return raw
}
