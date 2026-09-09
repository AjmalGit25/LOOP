import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { classifyBatch } from '@/lib/ai'

// Max items per batch call — keeps latency and cost predictable
const BATCH_SIZE = 20

export async function POST(req: NextRequest) {
  const { session, response } = await requireRole('ADMIN', 'ANALYST')
  if (response) return response

  const wid = session.user.workspaceId

  // Parse optional limit from body
  const body = await req.json().catch(() => ({}))
  const limit = Math.min(Number(body.limit) || BATCH_SIZE, 50)

  // Only fetch feedback that has NOT been classified yet (sentiment is null)
  const unclassified = await prisma.feedback.findMany({
    where: { workspaceId: wid, sentiment: null },
    select: { id: true, content: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  if (unclassified.length === 0) {
    return NextResponse.json({ classified: 0, message: 'All feedback is already classified.' })
  }

  // Call Claude for each item sequentially
  const results = await classifyBatch(unclassified)

  // Resolve theme names → theme IDs for this workspace
  const allThemeNames = [...new Set(results.flatMap(r => r.classification.themes))]
  const workspaceThemes = await prisma.theme.findMany({
    where: { workspaceId: wid, name: { in: allThemeNames } },
    select: { id: true, name: true },
  })
  const themeMap = Object.fromEntries(workspaceThemes.map(t => [t.name.toLowerCase(), t.id]))

  // Persist each classification in a transaction
  let classified = 0
  for (const { id, classification } of results) {
    const { sentiment, sentimentScore, themes, summary } = classification

    // Resolve theme IDs — skip any theme name not in this workspace
    const themeIds = themes
      .map(name => themeMap[name.toLowerCase()])
      .filter(Boolean) as string[]

    await prisma.$transaction([
      prisma.feedback.update({
        where: { id },
        data: {
          sentiment:      sentiment as never,
          sentimentScore,
          sourceRef:      summary,   // store AI summary in sourceRef for display
        },
      }),
      // Upsert FeedbackTheme links (skip duplicates)
      ...themeIds.map(themeId =>
        prisma.feedbackTheme.upsert({
          where:  { feedbackId_themeId: { feedbackId: id, themeId } },
          create: { feedbackId: id, themeId, confidence: 0.9 },
          update: {},
        })
      ),
    ])

    classified++
  }

  return NextResponse.json({
    classified,
    total: unclassified.length,
    message: `Classified ${classified} of ${unclassified.length} feedback items.`,
  })
}
