import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string
        if (!email || !password) return null

        // Lazy — never bundled into edge/middleware
        const { prisma } = await import('@/lib/prisma')
        const { default: bcrypt } = await import('bcryptjs')

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        const authUser = user as {
          id: string
          name: string
          email: string
          role: 'ADMIN' | 'ANALYST' | 'VIEWER'
          workspaceId: string
        }

        return {
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          role: authUser.role,
          workspaceId: authUser.workspaceId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userRecord = user as { id?: string; role?: string; workspaceId?: string }
        token.id = userRecord.id
        token.role = userRecord.role
        token.workspaceId = userRecord.workspaceId
      }
      return token
    },
    async session({ session, token }) {
      const tokenRecord = token as { id?: string; role?: string; workspaceId?: string }
      session.user.id = tokenRecord.id as string
      session.user.role = tokenRecord.role as string
      session.user.workspaceId = tokenRecord.workspaceId as string
      return session
    },
  },
})
