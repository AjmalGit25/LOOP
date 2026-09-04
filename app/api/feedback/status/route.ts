import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { FeedbackStatus } from '@prisma/client'

export async function PATCH(req: NextRequest) {
  const { session, response } = await requireRole('ADMIN', 'ANALYST')
  if (response) return response

  const { id, status } = await req.json()

  if (!id || !Object.values(FeedbackStatus).includes(status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // updateMany with workspaceId guard — cannot update feedback from another workspace
  const result = await prisma.feedback.updateMany({
    where: { id, workspaceId: session.user.workspaceId },
    data: { status },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
