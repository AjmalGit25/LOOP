'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <p className='text-gray-500 text-sm'>Loading session...</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className='min-h-screen bg-black flex items-center justify-center'>
      <div className='w-full max-w-100 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden'>

        {/* Header */}
        <div className='p-5 flex flex-col gap-3'>
          <h1 className='text-white font-semibold text-center'>Dashboard</h1>
          <span className='w-full border-b border-gray-800'></span>
        </div>

        {/* Session info */}
        <div className='px-5 pb-2 flex flex-col gap-3'>
          {[
            { label: 'Name', value: session.user.name },
            { label: 'Email', value: session.user.email },
            { label: 'Role', value: session.user.role },
            { label: 'Workspace ID', value: session.user.workspaceId },
            { label: 'User ID', value: session.user.id },
          ].map(({ label, value }) => (
            <div key={label} className='flex flex-col gap-1'>
              <span className='text-white text-xs font-bold'>{label}</span>
              <span className='bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300 break-all'>
                {value ?? '—'}
              </span>
            </div>
          ))}
        </div>

        {/* Admin: Members link */}
        {session.user.role === 'ADMIN' && (
          <div className='px-5'>
            <button
              onClick={() => router.push('/dashboard/members')}
              className='w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium py-2 rounded-lg transition-colors'
            >
              Manage Members →
            </button>
          </div>
        )}

        {/* Logout */}
        <div className='p-5'>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className='w-full mt-2 bg-linear-to-r from-gold-300 to-gold-600 text-black font-bold shadow-xl hover:shadow-gold-500/10 hover:-translate-y-0.5 transition-all duration-100 py-2 rounded-full cursor-pointer'
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  )
}
