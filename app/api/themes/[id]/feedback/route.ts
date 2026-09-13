import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth()
  if (response) return response

  const { id: themeId } = await params
  const wid = session.user.workspaceId

  // Verify theme belongs to this workspace
  const theme = await prisma.theme.findFirst({
    where: { id: themeId, workspaceId: wid },
    select: { id: true, name: true, color: true, description: true },
  })

  if (!theme) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10')))

  const [total, feedbackThemes] = await Promise.all([
    prisma.feedbackTheme.count({
      where: { themeId, feedback: { workspaceId: wid } },
    }),
    prisma.feedbackTheme.findMany({
      where: { themeId, feedback: { workspaceId: wid } },
      select: {
        confidence: true,
        feedback: {
          select: {
            id: true, content: true, channel: true,
            customerLabel: true, sentiment: true, sentimentScore: true,
            status: true, createdAt: true, sourceRef: true,
          },
        },
      },
      orderBy: { feedback: { createdAt: 'desc' } },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({
    theme,
    feedback: feedbackThemes.map(ft => ({ ...ft.feedback, confidence: ft.confidence })),
    pagination: {
      page, limit, total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  })
}
