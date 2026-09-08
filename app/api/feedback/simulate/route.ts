import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { FEEDBACK_RECORDS } from '@/lib/feedback-data'
import { FeedbackStatus, Sentiment } from '@prisma/client'

const CHANNEL_SOURCES: Record<string, string[]> = {
  slack:   ['slack'],
  email:   ['email'],
  mobile:  ['mobile'],
  support: ['support'],
  web:     ['web'],
  all:     ['slack', 'email', 'mobile', 'support', 'web', 'social'],
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireRole('ADMIN', 'ANALYST')
  if (response) return response

  const { source = 'all', count = 130 } = await req.json()

  const channels = CHANNEL_SOURCES[source] ?? CHANNEL_SOURCES.all

  // Filter records by channel if a specific source is selected
  const pool = source === 'all'
    ? FEEDBACK_RECORDS
    : FEEDBACK_RECORDS.filter(r => channels.includes(r.channel))

  // If pool is smaller than requested count, cycle through it
  const records = Array.from({ length: Math.min(count, 150) }, (_, i) => pool[i % pool.length])

  const statuses = [FeedbackStatus.NEW, FeedbackStatus.NEW, FeedbackStatus.REVIEWED, FeedbackStatus.ACTIONED]

  await prisma.feedback.createMany({
    data: records.map((r, i) => ({
      content:        r.content,
      channel:        source === 'all' ? r.channel : source,
      customerLabel:  r.customerLabel,
      sentiment:      r.sentiment as Sentiment,
      sentimentScore: r.sentimentScore,
      status:         statuses[i % statuses.length],
      workspaceId:    session.user.workspaceId,
      createdAt:      new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000),
    })),
    skipDuplicates: false,
  })

  return NextResponse.json({ inserted: records.length }, { status: 201 })
}
