import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-guard'
import { getWorkspaceMembers, updateMemberRole, removeMember } from '@/lib/workspace'
import { Role } from '@prisma/client'

export async function GET() {
  const { session, response } = await requireRole('ADMIN')
  if (response) return response

  const members = await getWorkspaceMembers(session.user.workspaceId)
  return NextResponse.json({ members })
}

export async function PATCH(req: NextRequest) {
  const { session, response } = await requireRole('ADMIN')
  if (response) return response

  const { userId, role } = await req.json()
  if (!userId || !Object.values(Role).includes(role)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  await updateMemberRole(session.user.workspaceId, userId, role)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { session, response } = await requireRole('ADMIN')
  if (response) return response

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  if (userId === session.user.id) {
    return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
  }

  await removeMember(session.user.workspaceId, userId)
  return NextResponse.json({ success: true })
}
