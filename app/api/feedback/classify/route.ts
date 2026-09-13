import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { classifyFeedback, persistClassification, getWorkspaceThemeNames } from '@/lib/ai'

const MAX_BATCH = 50

// GET — return how many items still need classification
export async function GET() {
  const { session, response } = await requireRole('ADMIN', 'ANALYST')
  if (response) return response

  const unclassified = await prisma.feedback.count({
    where: { workspaceId: session.user.workspaceId, sentiment: null },
  })

  const total = await prisma.feedback.count({
    where: { workspaceId: session.user.workspaceId },
  })

  return NextResponse.json({ unclassified, total })
}

// POST — back-fill unclassified feedback in a batch
export async function POST(req: NextRequest) {
  const { session, response } = await requireRole('ADMIN', 'ANALYST')
  if (response) return response

  const wid = session.user.workspaceId
  const body = await req.json().catch(() => ({}))
  const limit = Math.min(Number(body.limit) || 20, MAX_BATCH)

  const unclassified = await prisma.feedback.findMany({
    where: { workspaceId: wid, sentiment: null },
    select: { id: true, content: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  if (unclassified.length === 0) {
    return NextResponse.json({ classified: 0, skipped: 0, message: 'All feedback is already classified.' })
  }

  // Fetch existing theme names once — passed to every Claude call so it reuses them
  const existingThemes = await getWorkspaceThemeNames(wid)

  let classified = 0
  let skipped = 0

  for (const item of unclassified) {
    try {
      const cls = await classifyFeedback(item.content, existingThemes)
      await persistClassification(item.id, wid, cls)
      classified++
    } catch (err) {
      console.error(`[classify] skipping ${item.id}:`, err)
      skipped++
    }
  }

  // Count remaining after this batch
  const remaining = await prisma.feedback.count({
    where: { workspaceId: wid, sentiment: null },
  })

  return NextResponse.json({
    classified,
    skipped,
    remaining,
    message: `Classified ${classified}${skipped > 0 ? `, skipped ${skipped}` : ''}. ${remaining} item${remaining !== 1 ? 's' : ''} remaining.`,
  })
}
