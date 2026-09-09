import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { session, response } = await requireAuth()
  if (response) return response

  const wid = session.user.workspaceId

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [total, byStatus, byChannel, bySentiment, recent, themeRows] = await Promise.all([
    prisma.feedback.count({ where: { workspaceId: wid } }),

    prisma.feedback.groupBy({
      by: ['status'],
      where: { workspaceId: wid },
      _count: { status: true },
    }),

    prisma.feedback.groupBy({
      by: ['channel'],
      where: { workspaceId: wid },
      _count: { channel: true },
    }),

    prisma.feedback.groupBy({
      by: ['sentiment'],
      where: { workspaceId: wid, sentiment: { not: null } },
      _count: { sentiment: true },
    }),

    prisma.feedback.findMany({
      where: { workspaceId: wid, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),

    // Top themes by feedback count
    prisma.feedbackTheme.groupBy({
      by: ['themeId'],
      where: { feedback: { workspaceId: wid } },
      _count: { themeId: true },
      orderBy: { _count: { themeId: 'desc' } },
      take: 6,
    }),
  ])

  // Resolve theme names
  const themeIds = themeRows.map(r => r.themeId)
  const themes = themeIds.length
    ? await prisma.theme.findMany({ where: { id: { in: themeIds } }, select: { id: true, name: true, color: true } })
    : []
  const themeMap = Object.fromEntries(themes.map(t => [t.id, t]))
  const topThemes = themeRows.map(r => ({
    name:  themeMap[r.themeId]?.name  ?? r.themeId,
    color: themeMap[r.themeId]?.color ?? null,
    count: r._count.themeId,
  }))

  // Build daily buckets (last 7 days)
  const dailyMap: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    dailyMap[d.toISOString().slice(0, 10)] = 0
  }
  recent.forEach(f => {
    const key = f.createdAt.toISOString().slice(0, 10)
    if (key in dailyMap) dailyMap[key]++
  })
  const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

  return NextResponse.json({
    total,
    byStatus:    byStatus.map(r => ({ status: r.status, count: r._count.status })),
    byChannel:   byChannel.map(r => ({ channel: r.channel, count: r._count.channel })),
    bySentiment: bySentiment.map(r => ({ sentiment: r.sentiment, count: r._count.sentiment })),
    topThemes,
    daily,
  })
}
