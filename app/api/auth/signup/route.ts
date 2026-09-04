import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const SignupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = SignupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { name, email, password, role } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name: `${name}'s Workspace` },
      })
      return tx.user.create({
        data: { name, email, passwordHash, role, workspaceId: workspace.id },
        select: { id: true, name: true, email: true, role: true },
      })
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    console.error('[signup]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
