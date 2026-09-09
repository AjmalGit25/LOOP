import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { FeedbackStatus } from '@prisma/client'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireRole('ADMIN', 'ANALYST')
  if (response) return response

  const { id } = await params
  const { status } = await req.json()

  if (!Object.values(FeedbackStatus).includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const result = await prisma.feedback.updateMany({
    where: { id, workspaceId: session.user.workspaceId },
    data: { status },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
