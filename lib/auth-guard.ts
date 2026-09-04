import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'

type Role = 'ADMIN' | 'ANALYST' | 'VIEWER'

type AuthResult =
  | { session: Session; error: null; response: null }
  | { session: null; error: string; response: NextResponse }

export async function requireRole(...roles: Role[]): Promise<AuthResult> {
  const session = await auth()

  if (!session) {
    return {
      session: null,
      error: 'Unauthenticated',
      response: NextResponse.json({ error: 'Unauthenticated' }, { status: 401 }),
    }
  }

  if (!roles.includes(session.user.role as Role)) {
    return {
      session: null,
      error: 'Forbidden',
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { session, error: null, response: null }
}

// Requires any authenticated session regardless of role
export async function requireAuth(): Promise<AuthResult> {
  return requireRole('ADMIN', 'ANALYST', 'VIEWER')
}
