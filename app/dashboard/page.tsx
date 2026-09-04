'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardNav from '@/app/components/dashboard/DashboardNav'
import Overview from '@/app/components/dashboard/Overview'
import FeedbackInbox from '@/app/components/dashboard/FeedbackInbox'
import AdminPanel from '@/app/components/dashboard/AdminPanel'

type Tab = 'overview' | 'feedback' | 'admin'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <p className='text-gray-500 text-sm'>Loading...</p>
      </div>
    )
  }

  if (!session) return null

  const role = session.user.role
  const isAdmin = role === 'ADMIN'
  const isAnalyst = role === 'ANALYST'

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'overview', label: 'Overview', show: true },
    { id: 'feedback', label: 'Feedback Inbox', show: true },
    { id: 'admin', label: 'Members', show: isAdmin },
  ]

  return (
    <div className='flex min-h-screen bg-black'>
      <DashboardNav role={role} name={session.user.name ?? ''} />

      <main className='flex-1 flex flex-col min-w-0'>

        {/* Top bar */}
        <div className='border-b border-gray-800 px-6 py-4 flex items-center justify-between'>
          <div>
            <h1 className='text-white font-semibold'>
              {tab === 'overview' && 'Overview'}
              {tab === 'feedback' && 'Feedback Inbox'}
              {tab === 'admin' && 'Members'}
            </h1>
            <p className='text-gray-500 text-xs mt-0.5'>
              {session.user.name} · {session.user.workspaceId}
            </p>
          </div>

          {/* Role badge */}
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isAdmin ? 'text-gold-400 bg-gold-400/10 border-gold-400/20'
            : isAnalyst ? 'text-blue-400 bg-blue-400/10 border-blue-400/20'
            : 'text-gray-400 bg-gray-400/10 border-gray-400/20'
          }`}>
            {role}
          </span>
        </div>

        {/* Tab bar */}
        <div className='border-b border-gray-800 px-6 flex gap-1'>
          {tabs.filter(t => t.show).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-sm px-4 py-3 border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-gold-500 text-white font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className='flex-1 p-6 overflow-auto'>

          {tab === 'overview' && (
            <div className='flex flex-col gap-6'>
              <Overview />

              {/* Role-specific quick actions */}
              {(isAdmin || isAnalyst) && (
                <div className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3'>
                  <p className='text-white text-sm font-semibold'>Quick actions</p>
                  <div className='flex flex-wrap gap-2'>
                    <button
                      onClick={() => setTab('feedback')}
                      className='text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors'
                    >
                      View Feedback Inbox →
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/feedback/import')}
                      className='text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors'
                    >
                      Import CSV →
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setTab('admin')}
                        className='text-sm bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/20 text-gold-400 px-4 py-2 rounded-lg transition-colors'
                      >
                        Manage Members →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Viewer read-only notice */}
              {role === 'VIEWER' && (
                <div className='bg-gray-900 border border-gray-800 rounded-xl p-5'>
                  <p className='text-gray-400 text-sm'>
                    You have <span className='text-white font-medium'>read-only</span> access.
                    Switch to the Feedback Inbox tab to browse all feedback.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'feedback' && <FeedbackInbox role={role} />}

          {/* Admin-only — UI hidden + API enforced */}
          {tab === 'admin' && isAdmin && <AdminPanel currentUserId={session.user.id} />}
          {tab === 'admin' && !isAdmin && (
            <p className='text-red-400 text-sm'>Access denied.</p>
          )}

        </div>
      </main>
    </div>
  )
}
