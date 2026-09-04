import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

// Every helper takes workspaceId — no query ever runs without it

export function getWorkspaceMembers(workspaceId: string) {
  return prisma.user.findMany({
    where: { workspaceId },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  })
}

export function getWorkspaceFeedback(workspaceId: string) {
  return prisma.feedback.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  })
}

export function getWorkspaceThemes(workspaceId: string) {
  return prisma.theme.findMany({
    where: { workspaceId },
    orderBy: { name: 'asc' },
  })
}

export function getWorkspaceReports(workspaceId: string) {
  return prisma.report.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  })
}

export function updateMemberRole(workspaceId: string, userId: string, role: Role) {
  return prisma.user.updateMany({
    where: { id: userId, workspaceId },   // workspaceId guard prevents cross-workspace update
    data: { role },
  })
}

export function removeMember(workspaceId: string, userId: string) {
  return prisma.user.deleteMany({
    where: { id: userId, workspaceId },   // workspaceId guard prevents cross-workspace delete
  })
}
