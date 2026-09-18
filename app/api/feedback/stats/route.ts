import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

function parseDate(value: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export async function GET(req: Request) {
  const { session, response } = await requireAuth()
  if (response) return response

  const wid = session.user.workspaceId
  const { searchParams } = new URL(req.url)

  const startFrom = parseDate(searchParams.get('from'))
  const endTo = parseDate(searchParams.get('to'))

  const now = new Date()
  let rangeStart = startFrom ?? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  let rangeEnd = endTo ?? now

  if (rangeStart > rangeEnd) {
    ;[rangeStart, rangeEnd] = [rangeEnd, rangeStart]
  }

  const where = {
    workspaceId: wid,
    createdAt: { gte: rangeStart, lte: rangeEnd },
  }

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const newThisWeekStart = new Date(Math.max(weekAgo.getTime(), rangeStart.getTime()))

  const [total, byStatus, byChannel, bySentiment, recent, themeRows, newThisWeek] = await Promise.all([
    prisma.feedback.count({ where }),

    prisma.feedback.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    }),

    prisma.feedback.groupBy({
      by: ['channel'],
      where,
      _count: { channel: true },
    }),

    prisma.feedback.groupBy({
      by: ['sentiment'],
      where: { ...where, sentiment: { not: null } },
      _count: { sentiment: true },
    }),

    prisma.feedback.findMany({
      where,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),

    prisma.feedbackTheme.groupBy({
      by: ['themeId'],
      where: { feedback: where },
      _count: { themeId: true },
      orderBy: { _count: { themeId: 'desc' } },
      take: 6,
    }),

    prisma.feedback.count({
      where: {
        workspaceId: wid,
        createdAt: { gte: newThisWeekStart, lte: rangeEnd },
      },
    }),
  ])

  const themeIds = themeRows.map(r => r.themeId)
  const themes = themeIds.length
    ? await prisma.theme.findMany({ where: { id: { in: themeIds } }, select: { id: true, name: true, color: true } })
    : []

  const themeMap = Object.fromEntries(themes.map(t => [t.id, t]))
  const topThemes = themeRows.map(r => ({
    name: themeMap[r.themeId]?.name ?? r.themeId,
    color: themeMap[r.themeId]?.color ?? null,
    count: r._count.themeId,
  }))

  const dailyMap: Record<string, number> = {}
  const current = new Date(rangeStart)
  while (current <= rangeEnd) {
    const key = current.toISOString().slice(0, 10)
    dailyMap[key] = 0
    current.setUTCDate(current.getUTCDate() + 1)
  }

  recent.forEach(f => {
    const key = f.createdAt.toISOString().slice(0, 10)
    if (key in dailyMap) dailyMap[key]++
  })

  const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))
  const negativeCount = bySentiment.find(r => r.sentiment === 'NEG')?._count.sentiment ?? 0
  const negativePercentage = total ? (negativeCount / total) * 100 : 0

  return NextResponse.json({
    total,
    negativePercentage,
    newThisWeek,
    byStatus: byStatus.map(r => ({ status: r.status, count: r._count.status })),
    byChannel: byChannel.map(r => ({ channel: r.channel, count: r._count.channel })),
    bySentiment: bySentiment.map(r => ({ sentiment: r.sentiment, count: r._count.sentiment })),
    topThemes,
    daily,
  })
}
