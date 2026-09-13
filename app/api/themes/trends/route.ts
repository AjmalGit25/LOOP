import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

// A theme is "spiking" when current > previous AND increase >= 50%
const SPIKE_THRESHOLD = 0.5

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function startOfDay(d: Date) {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function endOfDay(d: Date) {
  const c = new Date(d)
  c.setHours(23, 59, 59, 999)
  return c
}

export async function GET(req: NextRequest) {
  const { session, response } = await requireAuth()
  if (response) return response

  const wid = session.user.workspaceId
  const { searchParams } = new URL(req.url)
  const days = Math.min(90, Math.max(7, parseInt(searchParams.get('days') ?? '7')))

  const now = new Date()

  // Current period: last `days` days (inclusive today)
  const currentStart = startOfDay(new Date(now.getTime() - (days - 1) * 86400000))
  const currentEnd   = endOfDay(now)

  // Previous period: the `days` days immediately before current
  const prevStart = startOfDay(new Date(currentStart.getTime() - days * 86400000))
  const prevEnd   = endOfDay(new Date(currentStart.getTime() - 1))

  // Fetch all FeedbackTheme rows for both periods in one query
  const rows = await prisma.feedbackTheme.findMany({
    where: {
      feedback: {
        workspaceId: wid,
        createdAt: { gte: prevStart, lte: currentEnd },
      },
    },
    select: {
      themeId: true,
      feedback: { select: { createdAt: true } },
      theme:    { select: { id: true, name: true, color: true } },
    },
  })

  // Collect unique themes
  const themeMap = new Map<string, { id: string; name: string; color: string | null }>()
  for (const r of rows) {
    if (!themeMap.has(r.themeId)) themeMap.set(r.themeId, r.theme)
  }

  // Count per theme per period
  const currentCounts = new Map<string, number>()
  const prevCounts    = new Map<string, number>()

  // Timeline: date → themeId → count (current period only)
  const timelineMap = new Map<string, Map<string, number>>()

  // Pre-fill all dates in current period
  for (let i = 0; i < days; i++) {
    const d = isoDate(new Date(currentStart.getTime() + i * 86400000))
    timelineMap.set(d, new Map())
  }

  for (const r of rows) {
    const createdAt = r.feedback.createdAt
    const tid = r.themeId

    if (createdAt >= currentStart && createdAt <= currentEnd) {
      currentCounts.set(tid, (currentCounts.get(tid) ?? 0) + 1)
      const d = isoDate(createdAt)
      if (timelineMap.has(d)) {
        const dayMap = timelineMap.get(d)!
        dayMap.set(tid, (dayMap.get(tid) ?? 0) + 1)
      }
    } else {
      prevCounts.set(tid, (prevCounts.get(tid) ?? 0) + 1)
    }
  }

  // Build theme trend objects
  const themes = Array.from(themeMap.values())
    .map(t => {
      const curr = currentCounts.get(t.id) ?? 0
      const prev = prevCounts.get(t.id)    ?? 0

      let change: number | null = null
      let spiking = false

      if (prev === 0 && curr > 0) {
        // New this period — treat as spiking
        change  = null
        spiking = true
      } else if (prev > 0) {
        change  = Math.round(((curr - prev) / prev) * 100 * 100) / 100
        spiking = curr > prev && change >= SPIKE_THRESHOLD * 100
      }

      return { id: t.id, name: t.name, color: t.color, currentCount: curr, previousCount: prev, change, spiking }
    })
    .filter(t => t.currentCount > 0 || t.previousCount > 0)
    .sort((a, b) => b.currentCount - a.currentCount)

  // Build timeline rows for Recharts
  // Each row: { date, [themeName]: count, ... }
  const timeline = Array.from(timelineMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayMap]) => {
      const row: Record<string, string | number> = { date }
      for (const t of themes) {
        row[t.name] = dayMap.get(t.id) ?? 0
      }
      return row
    })

  return NextResponse.json({
    period:         { start: isoDate(currentStart), end: isoDate(currentEnd), days },
    previousPeriod: { start: isoDate(prevStart),    end: isoDate(prevEnd) },
    themes,
    timeline,
  })
}
