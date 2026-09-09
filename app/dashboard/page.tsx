'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardNav from '@/app/components/dashboard/DashboardNav'
import Overview from '@/app/components/dashboard/Overview'
import FeedbackInbox from '@/app/components/dashboard/FeedbackInbox'
import AdminPanel from '@/app/components/dashboard/AdminPanel'
import SimulateChannel from '@/app/components/dashboard/SimulateChannel'
import ClassifyButton from '@/app/components/dashboard/ClassifyButton'

type Tab = 'overview' | 'feedback' | 'analytics' | 'admin'

const TAB_LABELS: Record<Tab, string> = {
  overview:  'Overview',
  feedback:  'Feedback Inbox',
  analytics: 'Analytics',
  admin:     'Members',
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [overviewKey, setOverviewKey] = useState(0)

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
  const isAdmin   = role === 'ADMIN'
  const isAnalyst = role === 'ANALYST'

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'overview',  label: 'Overview',       show: true },
    { id: 'feedback',  label: 'Feedback Inbox', show: true },
    { id: 'analytics', label: 'Analytics',      show: isAdmin || isAnalyst },
    { id: 'admin',     label: 'Members',        show: isAdmin },
  ]

  return (
    <div className='flex min-h-screen bg-black'>
      <DashboardNav role={role} name={session.user.name ?? ''} />

      <main className='flex-1 flex flex-col min-w-0 h-screen'>

        {/* Top bar */}
        <div className='border-b border-gray-800 px-6 py-4 flex items-center justify-between shrink-0'>
          <div>
            <h1 className='text-white font-semibold'>{TAB_LABELS[tab]}</h1>
            <p className='text-gray-500 text-xs mt-0.5'>
              {session.user.name} · <span className='text-gray-600'>LOOP Demo Workspace</span>
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isAdmin   ? 'text-gold-400 bg-gold-400/10 border-gold-400/20'
            : isAnalyst ? 'text-blue-400 bg-blue-400/10 border-blue-400/20'
            : 'text-gray-400 bg-gray-400/10 border-gray-400/20'
          }`}>
            {role}
          </span>
        </div>

        {/* Tab bar */}
        <div className='border-b border-gray-800 px-6 flex gap-1 shrink-0'>
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

          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div className='flex flex-col gap-6'>
              <Overview key={overviewKey} />

              {/* Quick-action cards */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                <button
                  onClick={() => setTab('feedback')}
                  className='bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 text-left flex flex-col gap-1 transition-colors'
                >
                  <span className='text-white text-sm font-medium'>Feedback Inbox →</span>
                  <span className='text-gray-500 text-xs'>Browse, search and filter all feedback</span>
                </button>

                {(isAdmin || isAnalyst) && (
                  <button
                    onClick={() => setTab('analytics')}
                    className='bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 text-left flex flex-col gap-1 transition-colors'
                  >
                    <span className='text-white text-sm font-medium'>Analytics →</span>
                    <span className='text-gray-500 text-xs'>Deep-dive charts and trend analysis</span>
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => setTab('admin')}
                    className='bg-gold-500/5 border border-gold-500/20 hover:border-gold-500/40 rounded-xl p-4 text-left flex flex-col gap-1 transition-colors'
                  >
                    <span className='text-gold-400 text-sm font-medium'>Manage Members →</span>
                    <span className='text-gray-500 text-xs'>Roles, invites and workspace access</span>
                  </button>
                )}
              </div>

              {/* Tools — ANALYST/ADMIN only */}
              {(isAdmin || isAnalyst) && (
                <div className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4'>
                  <p className='text-white text-sm font-semibold'>Tools</p>
                  <SimulateChannel onDone={() => setOverviewKey(k => k + 1)} />
                  <div className='border-t border-gray-800 pt-3 flex flex-wrap gap-2'>
                    <ClassifyButton onDone={() => setOverviewKey(k => k + 1)} />
                    <button
                      onClick={() => router.push('/dashboard/feedback/import')}
                      className='text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition-colors'
                    >
                      Import CSV →
                    </button>
                  </div>
                </div>
              )}

              {/* Viewer notice */}
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

          {/* ── Feedback Inbox ── */}
          {tab === 'feedback' && <FeedbackInbox role={role} />}

          {/* ── Analytics (ADMIN/ANALYST only) ── */}
          {tab === 'analytics' && (isAdmin || isAnalyst) && (
            <div className='flex flex-col gap-6'>
              <Overview key={`analytics-${overviewKey}`} />
              {(isAdmin || isAnalyst) && (
                <div className='flex justify-end'>
                  <SimulateChannel onDone={() => setOverviewKey(k => k + 1)} />
                </div>
              )}
            </div>
          )}
          {tab === 'analytics' && !isAdmin && !isAnalyst && (
            <p className='text-red-400 text-sm'>Access denied.</p>
          )}

          {/* ── Members (ADMIN only) ── */}
          {tab === 'admin' && isAdmin && <AdminPanel currentUserId={session.user.id} />}
          {tab === 'admin' && !isAdmin && (
            <p className='text-red-400 text-sm'>Access denied.</p>
          )}

        </div>
      </main>
    </div>
  )
}
