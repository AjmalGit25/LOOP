import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { session, response } = await requireAuth()
  if (response) return response

  const themes = await prisma.theme.findMany({
    where: { workspaceId: session.user.workspaceId },
    select: { id: true, name: true, color: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ themes })
}
