import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { session, response } = await requireAuth()
  if (response) return response

  const wid = session.user.workspaceId

  const themes = await prisma.theme.findMany({
    where: { workspaceId: wid },
    select: {
      id: true,
      name: true,
      description: true,
      color: true,
      _count: { select: { feedback: true } },
    },
    orderBy: { feedback: { _count: 'desc' } },
  })

  return NextResponse.json({
    themes: themes.map(t => ({
      id:          t.id,
      name:        t.name,
      description: t.description,
      color:       t.color,
      count:       t._count.feedback,
    })),
  })
}
