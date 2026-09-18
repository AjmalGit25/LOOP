import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireAuth()
  if (response) return response

  const { id } = await params

  const report = await prisma.report.findFirst({
    where: {
      id,
      workspaceId: session.user.workspaceId,
    },
    include: {
      generatedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  return NextResponse.json({
    report: {
      id: report.id,
      title: report.title,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      createdAt: report.createdAt,
      content: report.contentJson,
      generatedBy: report.generatedBy.name,
    },
  })
}
