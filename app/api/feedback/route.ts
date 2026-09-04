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

export async function GET() {
  const { session, response } = await requireAuth()
  if (response) return response

  const feedback = await prisma.feedback.findMany({
    where: { workspaceId: session.user.workspaceId },
    select: { id: true, content: true, channel: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ feedback })
}
