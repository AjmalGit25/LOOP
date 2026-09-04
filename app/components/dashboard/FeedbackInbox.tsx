'use client'

import { useEffect, useState } from 'react'
import { FiSearch, FiFilter } from 'react-icons/fi'

type Feedback = { id: string; content: string; channel: string; status: string; createdAt: string }
type Props = { role: string }

const STATUS_COLORS: Record<string, string> = {
  NEW: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  REVIEWED: 'text-gold-400 bg-gold-400/10 border-gold-400/20',
  ACTIONED: 'text-green-400 bg-green-400/10 border-green-400/20',
}

const STATUSES = ['ALL', 'NEW', 'REVIEWED', 'ACTIONED']
const CHANNELS = ['ALL', 'web', 'email', 'mobile', 'support', 'social']
const PAGE_SIZE = 10

export default function FeedbackInbox({ role }: Props) {
  const [all, setAll] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [channelFilter, setChannelFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const canEdit = role === 'ADMIN' || role === 'ANALYST'

  useEffect(() => {
    fetch('/api/feedback')
      .then(r => r.json())
      .then(d => { setAll(d.feedback ?? []); setLoading(false) })
  }, [])

  async function updateStatus(id: string, status: string) {
    await fetch('/api/feedback/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setAll(prev => prev.map(f => f.id === id ? { ...f, status } : f))
  }

  const filtered = all.filter(f => {
    const matchSearch = f.content.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || f.status === statusFilter
    const matchChannel = channelFilter === 'ALL' || f.channel === channelFilter
    return matchSearch && matchStatus && matchChannel
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1) }, [search, statusFilter, channelFilter])

  return (
    <div className='flex flex-col gap-4'>

      {/* Toolbar */}
      <div className='flex flex-wrap gap-2'>
        {/* Search */}
        <div className='flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 flex-1 min-w-48'>
          <FiSearch size={13} className='text-gray-500 shrink-0' />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search feedback...'
            className='bg-transparent text-sm text-gray-300 placeholder-gray-600 focus:outline-none w-full'
          />
        </div>

        {/* Status filter */}
        <div className='flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2'>
          <FiFilter size={12} className='text-gray-500' />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='bg-transparent text-sm text-gray-300 focus:outline-none'
          >
            {STATUSES.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</option>)}
          </select>
        </div>

        {/* Channel filter */}
        <div className='flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2'>
          <select
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
            className='bg-transparent text-sm text-gray-300 focus:outline-none'
          >
            {CHANNELS.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All channels' : c}</option>)}
          </select>
        </div>
      </div>

      {/* Count */}
      <p className='text-gray-600 text-xs'>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>

      {/* List */}
      {loading ? (
        <p className='text-gray-500 text-sm text-center py-12'>Loading...</p>
      ) : paginated.length === 0 ? (
        <p className='text-gray-600 text-sm text-center py-12'>No feedback matches your filters.</p>
      ) : (
        <div className='flex flex-col gap-2'>
          {paginated.map(f => (
            <div key={f.id} className='bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-2 hover:border-gray-700 transition-colors'>
              <p className='text-gray-200 text-sm leading-relaxed'>{f.content}</p>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700'>{f.channel}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[f.status]}`}>{f.status}</span>
                <span className='text-xs text-gray-600 ml-auto'>{new Date(f.createdAt).toLocaleDateString()}</span>

                {/* Status workflow — ANALYST/ADMIN only */}
                {canEdit && (
                  <div className='flex gap-1 ml-2'>
                    {['NEW', 'REVIEWED', 'ACTIONED'].filter(s => s !== f.status).map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(f.id, s)}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors hover:opacity-80 ${STATUS_COLORS[s]}`}
                      >
                        → {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-2 pt-2'>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className='text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg disabled:opacity-30 transition-colors'
          >
            ← Prev
          </button>
          <span className='text-gray-500 text-xs'>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className='text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg disabled:opacity-30 transition-colors'
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
