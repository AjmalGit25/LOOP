'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Hide navbar inside dashboard — dashboard has its own nav
  if (pathname?.startsWith('/dashboard')) return null

  return (
    <nav className='border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50 px-6 py-4 flex items-center justify-between'>

      {/* Logo */}
      <Link href='/' className='text-white font-bold text-lg tracking-tight'>
        LO<span className='text-gold-500'>OP</span>
      </Link>

      {/* Links */}
      <div className='flex items-center gap-4'>
        {status === 'loading' ? null : session ? (
          <>
            <span className='text-gray-500 text-xs hidden sm:block'>
              {session.user.name} · <span className='text-gold-500'>{session.user.role}</span>
            </span>
            <Link
              href='/dashboard'
              className='text-gray-400 hover:text-white text-sm transition-colors'
            >
              Dashboard
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className='text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-1.5 rounded-full hover:border-gray-500 transition-colors'
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              href='/login'
              className={`text-sm transition-colors ${pathname === '/login' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Sign in
            </Link>
            <Link
              href='/signup'
              className='bg-linear-to-r from-gold-300 to-gold-600 text-black text-sm font-bold px-4 py-1.5 rounded-full hover:-translate-y-0.5 transition-all duration-100'
            >
              Get started
            </Link>
          </>
        )}
      </div>

    </nav>
  )
}
