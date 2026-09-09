'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { FiSearch, FiX, FiChevronLeft, FiChevronRight, FiSliders } from 'react-icons/fi'

type Theme = { id: string; name: string; color: string | null }
type FeedbackTheme = { theme: { name: string; color: string | null } }
type Feedback = {
  id: string
  content: string
  channel: string
  sourceRef: string | null
  customerLabel: string | null
  sentiment: 'POS' | 'NEU' | 'NEG' | null
  sentimentScore: number | null
  status: string
  createdAt: string
  themes: FeedbackTheme[]
}
type Pagination = { page: number; limit: number; total: number; totalPages: number }
type Props = { role: string }

const STATUS_STYLE: Record<string, string> = {
  NEW:      'text-blue-400 bg-blue-400/10 border-blue-400/20',
  REVIEWED: 'text-gold-400 bg-gold-400/10 border-gold-400/20',
  ACTIONED: 'text-green-400 bg-green-400/10 border-green-400/20',
}
const SENTIMENT_STYLE: Record<string, string> = {
  POS: 'text-green-400 bg-green-400/10 border-green-400/20',
  NEU: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  NEG: 'text-red-400 bg-red-400/10 border-red-400/20',
}
const SENTIMENT_LABEL: Record<string, string> = { POS: '▲ Positive', NEU: '● Neutral', NEG: '▼ Negative' }

const STATUSES   = ['ALL', 'NEW', 'REVIEWED', 'ACTIONED']
const CHANNELS   = ['ALL', 'web', 'email', 'mobile', 'support', 'social', 'slack']
const SENTIMENTS = ['ALL', 'POS', 'NEU', 'NEG']
const LIMIT = 10

const DATE_PRESETS = [
  { label: 'All time',    value: '' },
  { label: 'Today',       value: '1' },
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days',value: '30' },
  { label: 'Last 90 days',value: '90' },
]

function daysAgoISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

export default function FeedbackInbox({ role }: Props) {
  const canEdit = role === 'ADMIN' || role === 'ANALYST'

  const [items, setItems]           = useState<Feedback[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: LIMIT, total: 0, totalPages: 1 })
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [themes, setThemes]         = useState<Theme[]>([])

  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [statusFilter, setStatus]   = useState('ALL')
  const [channelFilter, setChannel] = useState('ALL')
  const [sentimentFilter, setSentiment] = useState('ALL')
  const [themeFilter, setTheme]     = useState('ALL')
  const [datePreset, setDatePreset] = useState('')
  const [page, setPage]             = useState(1)

  const [selected, setSelected]     = useState<Feedback | null>(null)
  const [updating, setUpdating]     = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Load themes once
  useEffect(() => {
    fetch('/api/feedback/themes')
      .then(r => r.json())
      .then(d => setThemes(d.themes ?? []))
  }, [])

  // Debounce search 400ms
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setDebounced(search); setPage(1) }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  // Reset page on any filter change
  useEffect(() => { setPage(1) }, [statusFilter, channelFilter, sentimentFilter, themeFilter, datePreset])

  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (debouncedSearch)          params.set('search',    debouncedSearch)
      if (statusFilter   !== 'ALL') params.set('status',    statusFilter)
      if (channelFilter  !== 'ALL') params.set('channel',   channelFilter)
      if (sentimentFilter !== 'ALL') params.set('sentiment', sentimentFilter)
      if (themeFilter    !== 'ALL') params.set('theme',     themeFilter)
      if (datePreset) {
        params.set('from', daysAgoISO(parseInt(datePreset)))
        params.set('to',   new Date().toISOString().split('T')[0])
      }
      const res = await fetch(`/api/feedback?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setItems(data.feedback ?? [])
      setPagination(data.pagination)
    } catch {
      setError('Could not load feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, statusFilter, channelFilter, sentimentFilter, themeFilter, datePreset])

  useEffect(() => { fetchFeedback() }, [fetchFeedback])

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/feedback/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      setItems(prev => prev.map(f => f.id === id ? { ...f, status } : f))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev)
    } finally {
      setUpdating(null)
    }
  }

  function clearAllFilters() {
    setSearch(''); setDebounced('')
    setStatus('ALL'); setChannel('ALL')
    setSentiment('ALL'); setTheme('ALL')
    setDatePreset(''); setPage(1)
  }

  const activeFilters = [
    statusFilter    !== 'ALL' && { key: 'status',    label: statusFilter,    clear: () => setStatus('ALL') },
    channelFilter   !== 'ALL' && { key: 'channel',   label: channelFilter,   clear: () => setChannel('ALL') },
    sentimentFilter !== 'ALL' && { key: 'sentiment', label: SENTIMENT_LABEL[sentimentFilter], clear: () => setSentiment('ALL') },
    themeFilter     !== 'ALL' && { key: 'theme',     label: themeFilter,     clear: () => setTheme('ALL') },
    datePreset               && { key: 'date',      label: DATE_PRESETS.find(d => d.value === datePreset)?.label ?? '', clear: () => setDatePreset('') },
    debouncedSearch          && { key: 'search',    label: `"${debouncedSearch}"`, clear: () => { setSearch(''); setDebounced('') } },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[]

  return (
    <div className='flex flex-col gap-4'>

      {/* Search + filter toggle row */}
      <div className='flex gap-2'>
        <div className='flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 flex-1'>
          <FiSearch size={13} className='text-gray-500 shrink-0' />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search feedback...'
            className='bg-transparent text-sm text-gray-300 placeholder-gray-600 focus:outline-none w-full'
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <FiX size={13} className='text-gray-500 hover:text-white' />
            </button>
          )}
        </div>
        <button
          onClick={() => setFiltersOpen(o => !o)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            filtersOpen || activeFilters.length > 0
              ? 'border-gold-500/40 bg-gold-500/10 text-gold-400'
              : 'border-gray-800 bg-gray-900 text-gray-400 hover:text-white hover:border-gray-700'
          }`}
        >
          <FiSliders size={13} />
          Filters
          {activeFilters.length > 0 && (
            <span className='bg-gold-500 text-black text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center'>
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* Expanded filter panel */}
      {filtersOpen && (
        <div className='bg-gray-900 border border-gray-800 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
          {/* Status */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-gray-500 text-xs uppercase tracking-wider'>Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatus(e.target.value)}
              className='bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-gray-600'
            >
              {STATUSES.map(s => <option key={s} value={s} className='bg-gray-900'>{s === 'ALL' ? 'All' : s}</option>)}
            </select>
          </div>

          {/* Channel */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-gray-500 text-xs uppercase tracking-wider'>Channel</label>
            <select
              value={channelFilter}
              onChange={e => setChannel(e.target.value)}
              className='bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-gray-600'
            >
              {CHANNELS.map(c => <option key={c} value={c} className='bg-gray-900'>{c === 'ALL' ? 'All' : c}</option>)}
            </select>
          </div>

          {/* Sentiment */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-gray-500 text-xs uppercase tracking-wider'>Sentiment</label>
            <select
              value={sentimentFilter}
              onChange={e => setSentiment(e.target.value)}
              className='bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-gray-600'
            >
              {SENTIMENTS.map(s => (
                <option key={s} value={s} className='bg-gray-900'>
                  {s === 'ALL' ? 'All' : SENTIMENT_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Theme */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-gray-500 text-xs uppercase tracking-wider'>Theme</label>
            <select
              value={themeFilter}
              onChange={e => setTheme(e.target.value)}
              className='bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-gray-600'
            >
              <option value='ALL' className='bg-gray-900'>All</option>
              {themes.map(t => <option key={t.id} value={t.name} className='bg-gray-900'>{t.name}</option>)}
            </select>
          </div>

          {/* Date range */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-gray-500 text-xs uppercase tracking-wider'>Date</label>
            <select
              value={datePreset}
              onChange={e => setDatePreset(e.target.value)}
              className='bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-gray-600'
            >
              {DATE_PRESETS.map(d => <option key={d.value} value={d.value} className='bg-gray-900'>{d.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Active filter badges */}
      {activeFilters.length > 0 && (
        <div className='flex flex-wrap items-center gap-2'>
          {activeFilters.map(f => (
            <span
              key={f.key}
              className='flex items-center gap-1.5 text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1 rounded-full'
            >
              {f.label}
              <button onClick={f.clear} className='text-gray-500 hover:text-white'>
                <FiX size={11} />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className='text-xs text-gray-500 hover:text-white underline underline-offset-2 transition-colors'
          >
            Clear all
          </button>
        </div>
      )}

      {/* Result count */}
      <p className='text-gray-600 text-xs'>
        {loading
          ? 'Loading...'
          : `${pagination.total} result${pagination.total !== 1 ? 's' : ''}${activeFilters.length > 0 ? ' · filtered' : ''}`
        }
      </p>

      {error && <p className='text-red-400 text-sm text-center py-6'>{error}</p>}

      {/* Table */}
      {!error && (
        <div className='rounded-xl border border-gray-800 overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-800 bg-gray-900/60'>
                <th className='text-left text-xs text-gray-500 font-medium px-4 py-3'>Customer / Message</th>
                <th className='text-left text-xs text-gray-500 font-medium px-4 py-3 hidden sm:table-cell'>Channel</th>
                <th className='text-left text-xs text-gray-500 font-medium px-4 py-3 hidden md:table-cell'>Sentiment</th>
                <th className='text-left text-xs text-gray-500 font-medium px-4 py-3 hidden lg:table-cell'>Themes</th>
                <th className='text-left text-xs text-gray-500 font-medium px-4 py-3'>Status</th>
                <th className='text-left text-xs text-gray-500 font-medium px-4 py-3 hidden lg:table-cell'>Date</th>
                <th className='text-left text-xs text-gray-500 font-medium px-4 py-3'></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: LIMIT }).map((_, i) => (
                  <tr key={i} className='border-b border-gray-800/50'>
                    <td colSpan={7} className='px-4 py-3'>
                      <div className='h-4 bg-gray-800 rounded animate-pulse w-3/4' />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className='text-center py-16'>
                    <p className='text-gray-600 text-sm'>No feedback matches your filters.</p>
                    {activeFilters.length > 0 && (
                      <button onClick={clearAllFilters} className='text-xs text-gold-500 hover:text-gold-400 mt-2 underline underline-offset-2'>
                        Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                items.map(f => (
                  <tr
                    key={f.id}
                    className='border-b border-gray-800/50 hover:bg-gray-900/40 transition-colors cursor-pointer'
                    onClick={() => setSelected(f)}
                  >
                    <td className='px-4 py-3 max-w-xs'>
                      {f.customerLabel && <p className='text-xs text-gray-500 mb-0.5'>{f.customerLabel}</p>}
                      <p className='text-gray-200 text-xs leading-relaxed line-clamp-2'>{f.content}</p>
                    </td>

                    <td className='px-4 py-3 hidden sm:table-cell'>
                      <span className='text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-full'>
                        {f.channel}
                      </span>
                    </td>

                    <td className='px-4 py-3 hidden md:table-cell'>
                      {f.sentiment ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${SENTIMENT_STYLE[f.sentiment]}`}>
                          {SENTIMENT_LABEL[f.sentiment]}
                        </span>
                      ) : <span className='text-gray-700 text-xs'>—</span>}
                    </td>

                    <td className='px-4 py-3 hidden lg:table-cell'>
                      <div className='flex flex-wrap gap-1'>
                        {f.themes.length === 0
                          ? <span className='text-gray-700 text-xs'>—</span>
                          : f.themes.slice(0, 2).map(ft => (
                            <span
                              key={ft.theme.name}
                              className='text-xs px-1.5 py-0.5 rounded border border-gray-700 text-gray-400'
                              style={ft.theme.color ? { borderColor: ft.theme.color + '40', color: ft.theme.color } : {}}
                            >
                              {ft.theme.name}
                            </span>
                          ))
                        }
                        {f.themes.length > 2 && (
                          <span className='text-xs text-gray-600'>+{f.themes.length - 2}</span>
                        )}
                      </div>
                    </td>

                    <td className='px-4 py-3' onClick={e => e.stopPropagation()}>
                      {canEdit ? (
                        <select
                          value={f.status}
                          disabled={updating === f.id}
                          onChange={e => updateStatus(f.id, e.target.value)}
                          className={`text-xs px-2 py-0.5 rounded-full border bg-transparent focus:outline-none cursor-pointer disabled:opacity-50 ${STATUS_STYLE[f.status]}`}
                        >
                          {['NEW', 'REVIEWED', 'ACTIONED'].map(s => (
                            <option key={s} value={s} className='bg-gray-900 text-gray-200'>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLE[f.status]}`}>
                          {f.status}
                        </span>
                      )}
                    </td>

                    <td className='px-4 py-3 hidden lg:table-cell'>
                      <span className='text-xs text-gray-600'>
                        {new Date(f.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>

                    <td className='px-4 py-3' onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelected(f)}
                        className='text-xs text-gray-500 hover:text-white border border-gray-700 hover:border-gray-500 px-2 py-0.5 rounded-lg transition-colors'
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className='flex items-center justify-between pt-1'>
          <p className='text-gray-600 text-xs'>Page {pagination.page} of {pagination.totalPages}</p>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className='flex items-center gap-1 text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg disabled:opacity-30 transition-colors'
            >
              <FiChevronLeft size={12} /> Prev
            </button>

            <div className='flex gap-1'>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === pagination.totalPages || Math.abs(n - page) <= 1)
                .reduce<(number | '...')[]>((acc, n, i, arr) => {
                  if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...')
                  acc.push(n)
                  return acc
                }, [])
                .map((n, i) =>
                  n === '...' ? (
                    <span key={`e-${i}`} className='text-gray-600 text-xs px-1 py-1.5'>…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n as number)}
                      className={`text-xs w-7 h-7 rounded-lg border transition-colors ${
                        page === n
                          ? 'border-gold-500/40 bg-gold-500/10 text-gold-400'
                          : 'border-gray-700 text-gray-500 hover:text-white hover:border-gray-500'
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages || loading}
              className='flex items-center gap-1 text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg disabled:opacity-30 transition-colors'
            >
              Next <FiChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4'
          onClick={() => setSelected(null)}
        >
          <div
            className='bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg flex flex-col gap-5 p-6 shadow-2xl max-h-[90vh] overflow-y-auto'
            onClick={e => e.stopPropagation()}
          >
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-white font-semibold text-sm'>Feedback Detail</p>
                <p className='text-gray-600 text-xs font-mono mt-0.5'>{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className='text-gray-500 hover:text-white transition-colors'>
                <FiX size={18} />
              </button>
            </div>

            {selected.customerLabel && (
              <div className='flex flex-col gap-1'>
                <p className='text-gray-500 text-xs uppercase tracking-wider'>Customer</p>
                <p className='text-gray-200 text-sm'>{selected.customerLabel}</p>
              </div>
            )}

            <div className='flex flex-col gap-1'>
              <p className='text-gray-500 text-xs uppercase tracking-wider'>Message</p>
              <p className='text-gray-200 text-sm leading-relaxed bg-gray-900 border border-gray-800 rounded-xl p-4'>
                {selected.content}
              </p>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='flex flex-col gap-1'>
                <p className='text-gray-500 text-xs uppercase tracking-wider'>Channel</p>
                <span className='text-xs text-gray-300 bg-gray-800 border border-gray-700 px-2 py-1 rounded-lg w-fit'>
                  {selected.channel}
                </span>
              </div>

              <div className='flex flex-col gap-1'>
                <p className='text-gray-500 text-xs uppercase tracking-wider'>Sentiment</p>
                {selected.sentiment ? (
                  <div className='flex items-center gap-2'>
                    <span className={`text-xs px-2 py-1 rounded-lg border w-fit ${SENTIMENT_STYLE[selected.sentiment]}`}>
                      {SENTIMENT_LABEL[selected.sentiment]}
                    </span>
                    {selected.sentimentScore != null && (
                      <span className='text-gray-600 text-xs'>{(selected.sentimentScore * 100).toFixed(0)}%</span>
                    )}
                  </div>
                ) : <span className='text-gray-700 text-xs'>—</span>}
              </div>

              <div className='flex flex-col gap-1'>
                <p className='text-gray-500 text-xs uppercase tracking-wider'>Date</p>
                <p className='text-gray-300 text-xs'>
                  {new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {selected.sourceRef && (
                <div className='flex flex-col gap-1'>
                  <p className='text-gray-500 text-xs uppercase tracking-wider'>Source Ref</p>
                  <p className='text-gray-300 text-xs font-mono truncate'>{selected.sourceRef}</p>
                </div>
              )}
            </div>

            {selected.themes.length > 0 && (
              <div className='flex flex-col gap-1'>
                <p className='text-gray-500 text-xs uppercase tracking-wider'>Themes</p>
                <div className='flex flex-wrap gap-1.5'>
                  {selected.themes.map(ft => (
                    <span
                      key={ft.theme.name}
                      className='text-xs px-2 py-0.5 rounded-full border border-gray-700 text-gray-400'
                      style={ft.theme.color ? { borderColor: ft.theme.color + '40', color: ft.theme.color } : {}}
                    >
                      {ft.theme.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className='flex flex-col gap-2'>
              <p className='text-gray-500 text-xs uppercase tracking-wider'>Status</p>
              <div className='flex items-center gap-2 flex-wrap'>
                {['NEW', 'REVIEWED', 'ACTIONED'].map(s => (
                  <button
                    key={s}
                    disabled={!canEdit || selected.status === s || updating === selected.id}
                    onClick={() => updateStatus(selected.id, s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all disabled:cursor-not-allowed ${
                      selected.status === s
                        ? `${STATUS_STYLE[s]} font-semibold`
                        : 'text-gray-500 border-gray-700 hover:border-gray-500 hover:text-gray-300 disabled:opacity-30'
                    }`}
                  >
                    {selected.status === s ? `✓ ${s}` : s}
                  </button>
                ))}
              </div>
              {!canEdit && <p className='text-gray-600 text-xs'>Read-only — ANALYST or ADMIN role required.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
