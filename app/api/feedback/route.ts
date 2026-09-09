import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreateSchema = z.object({
  content: z.string().min(1),
  channel: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth()
  if (response) return response

  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const feedback = await prisma.feedback.create({
    data: {
      content: parsed.data.content,
      channel: parsed.data.channel,
      workspaceId: session.user.workspaceId,
    },
    select: { id: true, content: true, channel: true, status: true, createdAt: true },
  })

  return NextResponse.json({ feedback }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const { session, response } = await requireAuth()
  if (response) return response

  const { searchParams } = new URL(req.url)
  const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit  = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10')))
  const search  = searchParams.get('search')?.trim()  ?? ''
  const status  = searchParams.get('status')  ?? ''
  const channel = searchParams.get('channel') ?? ''

  const sentiment = searchParams.get('sentiment') ?? ''
  const theme     = searchParams.get('theme')     ?? ''
  const from      = searchParams.get('from')      ?? ''
  const to        = searchParams.get('to')        ?? ''

  // Build Prisma where — all conditions are AND-combined
  const where: Record<string, unknown> = { workspaceId: session.user.workspaceId }
  if (search)                    where.content   = { contains: search, mode: 'insensitive' }
  if (status  && status  !== 'ALL') where.status  = status
  if (channel && channel !== 'ALL') where.channel = channel
  if (sentiment && sentiment !== 'ALL') where.sentiment = sentiment

  // Theme filter — feedback must have at least one matching theme (case-insensitive name)
  if (theme && theme !== 'ALL') {
    where.themes = {
      some: {
        theme: { name: { equals: theme, mode: 'insensitive' } },
      },
    }
  }

  // Date range — end of `to` day is 23:59:59.999
  if (from || to) {
    const createdAt: Record<string, Date> = {}
    if (from) createdAt.gte = new Date(from)
    if (to) {
      const end = new Date(to)
      end.setHours(23, 59, 59, 999)
      createdAt.lte = end
    }
    where.createdAt = createdAt
  }

  const [total, feedback] = await Promise.all([
    prisma.feedback.count({ where }),
    prisma.feedback.findMany({
      where,
      select: {
        id: true, content: true, channel: true, sourceRef: true,
        customerLabel: true, sentiment: true, sentimentScore: true,
        status: true, createdAt: true,
        themes: { select: { theme: { select: { name: true, color: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({
    feedback,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  })
}
