import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { classifyFeedback, persistClassification } from '@/lib/ai'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireRole('ADMIN', 'ANALYST')
  if (response) return response

  const { id } = await params
  const wid = session.user.workspaceId

  // Verify the feedback belongs to this workspace
  const feedback = await prisma.feedback.findFirst({
    where: { id, workspaceId: wid },
    select: { id: true, content: true },
  })

  if (!feedback) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const cls = await classifyFeedback(feedback.content)
  await persistClassification(feedback.id, wid, cls)

  return NextResponse.json({
    success: true,
    classification: cls,
  })
}
