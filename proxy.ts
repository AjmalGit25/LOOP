import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/workspace/:path*', '/api/feedback/:path*', '/api/feedback/stats', '/api/feedback/status'],
}
