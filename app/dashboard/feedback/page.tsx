'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Feedback = {
  id: string
  content: string
  channel: string
  status: string
  createdAt: string
}

const CHANNELS = ['web', 'email', 'mobile', 'support', 'social']

const STATUS_COLORS: Record<string, string> = {
  NEW: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  REVIEWED: 'text-gold-400 bg-gold-400/10 border-gold-400/20',
  ACTIONED: 'text-green-400 bg-green-400/10 border-green-400/20',
}

export default function FeedbackPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [content, setContent] = useState('')
  const [channel, setChannel] = useState('web')
  const [submitting, setSubmitting] = useState(false)
  const [list, setList] = useState<Feedback[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/login'); return }
    if (status === 'authenticated') fetchFeedback()
  }, [status, router])

  async function fetchFeedback() {
    try {
      setLoadingList(true)
      setError('')
      const res = await fetch('/api/feedback')
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'Unable to load feedback')
      setList(data.feedback ?? [])
    } catch (err) {
      console.error('[feedback-page] load failed:', err)
      setError('Unable to load feedback. Please try again.')
      setList([])
    } finally {
      setLoadingList(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, channel }),
    })

    setSubmitting(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Failed to submit feedback' }))
      setError(data.error ?? 'Failed to submit feedback')
      return
    }

    setContent('')
    fetchFeedback()
  }

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <p className='text-gray-500 text-sm'>Loading...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black p-6'>
      <div className='max-w-2xl mx-auto flex flex-col gap-6'>

        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-white font-semibold text-lg'>Feedback</h1>
            <p className='text-gray-500 text-xs mt-0.5'>Submit and view workspace feedback</p>
          </div>
          <div className='flex items-center gap-3'>
            {(session?.user.role === 'ADMIN' || session?.user.role === 'ANALYST') && (
              <button
                onClick={() => router.push('/dashboard/feedback/import')}
                className='text-xs text-gold-400 hover:text-gold-300 border border-gold-400/20 px-3 py-1 rounded-lg transition-colors'
              >
                Import CSV
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard')}
              className='text-xs text-gray-400 hover:text-white transition-colors'
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Submit form */}
        <form onSubmit={handleSubmit} className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3'>
          <label className='text-white text-xs font-bold'>Feedback *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='The dashboard is very slow...'
            required
            rows={4}
            className='bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors resize-none'
          />

          <div className='flex items-center gap-3'>
            <div className='flex flex-col gap-1 flex-1'>
              <label className='text-white text-xs font-bold'>Channel *</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className='bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-gold-500 transition-colors'
              >
                {CHANNELS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type='submit'
              disabled={submitting}
              className='self-end bg-linear-to-r from-gold-300 to-gold-600 text-black font-bold px-6 py-2 rounded-full text-sm hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-50 cursor-pointer'
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          {error && <p className='text-red-400 text-xs'>{error}</p>}
        </form>

        {/* Feedback list */}
        <div className='flex flex-col gap-2'>
          <p className='text-gray-500 text-xs font-medium uppercase tracking-wider'>
            {loadingList ? 'Loading...' : `${list.length} feedback item${list.length !== 1 ? 's' : ''}`}
          </p>

          {error && (
            <div className='rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-center'>
              <p className='text-red-400 text-sm font-medium'>{error}</p>
              <button
                onClick={fetchFeedback}
                className='mt-3 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs hover:border-red-500/50 transition-colors'
              >
                Retry
              </button>
            </div>
          )}

          {loadingList && !error && (
            <div className='rounded-xl border border-gray-800 bg-gray-900 p-4 animate-pulse'>
              <div className='h-4 bg-gray-800 rounded w-3/4' />
              <div className='h-4 bg-gray-800 rounded w-1/2 mt-3' />
            </div>
          )}

          {list.map((f) => (
            <div key={f.id} className='bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-2'>
              <p className='text-gray-200 text-sm leading-relaxed'>{f.content}</p>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700'>
                  {f.channel}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[f.status]}`}>
                  {f.status}
                </span>
                <span className='text-xs text-gray-600 ml-auto'>
                  {new Date(f.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {!loadingList && !error && list.length === 0 && (
            <div className='rounded-xl border border-gray-800 bg-gray-900 p-6 text-center'>
              <p className='text-white text-sm font-medium'>No feedback yet.</p>
              <p className='text-gray-500 text-xs mt-2'>Submit the first customer comment above to get started.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
