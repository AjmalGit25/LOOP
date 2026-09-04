import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { session, response } = await requireAuth()
  if (response) return response

  const wid = session.user.workspaceId

  const [total, byStatus, byChannel, recent] = await Promise.all([
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

    // Last 7 days daily volume
    prisma.feedback.findMany({
      where: {
        workspaceId: wid,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  // Build daily buckets
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
    byStatus: byStatus.map(r => ({ status: r.status, count: r._count.status })),
    byChannel: byChannel.map(r => ({ channel: r.channel, count: r._count.channel })),
    daily,
  })
}
