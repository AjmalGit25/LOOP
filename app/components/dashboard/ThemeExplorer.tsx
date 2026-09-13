'use client'

import { useEffect, useState, useCallback } from 'react'
import { FiChevronLeft, FiChevronRight, FiArrowLeft } from 'react-icons/fi'

type Theme = { id: string; name: string; description: string | null; color: string | null; count: number }

type DrillFeedback = {
  id: string; content: string; channel: string
  customerLabel: string | null; sentiment: string | null
  sentimentScore: number | null; status: string
  createdAt: string; sourceRef: string | null; confidence: number | null
}

type Pagination = { page: number; limit: number; total: number; totalPages: number }

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

const DEFAULT_COLOR = '#6b7280'
const LIMIT = 10

export default function ThemeExplorer() {
  const [themes, setThemes]         = useState<Theme[]>([])
  const [loadingThemes, setLoadingThemes] = useState(true)
  const [selected, setSelected]     = useState<Theme | null>(null)

  const [drillItems, setDrillItems] = useState<DrillFeedback[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: LIMIT, total: 0, totalPages: 1 })
  const [loadingDrill, setLoadingDrill] = useState(false)
  const [drillPage, setDrillPage]   = useState(1)

  useEffect(() => {
    fetch('/api/themes')
      .then(r => r.json())
      .then(d => { setThemes(d.themes ?? []); setLoadingThemes(false) })
      .catch(() => setLoadingThemes(false))
  }, [])

  const fetchDrill = useCallback(async (themeId: string, page: number) => {
    setLoadingDrill(true)
    try {
      const res = await fetch(`/api/themes/${themeId}/feedback?page=${page}&limit=${LIMIT}`)
      const data = await res.json()
      setDrillItems(data.feedback ?? [])
      setPagination(data.pagination)
    } finally {
      setLoadingDrill(false)
    }
  }, [])

  function openTheme(theme: Theme) {
    setSelected(theme)
    setDrillPage(1)
    fetchDrill(theme.id, 1)
  }

  function changeDrillPage(p: number) {
    setDrillPage(p)
    if (selected) fetchDrill(selected.id, p)
  }

  // ── Theme list ──────────────────────────────────────────────────────────────
  if (!selected) {
    return (
      <div className='flex flex-col gap-4'>
        <div>
          <p className='text-white font-semibold text-sm'>Themes</p>
          <p className='text-gray-500 text-xs mt-0.5'>AI-generated topic clusters from your feedback</p>
        </div>

        {loadingThemes ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='bg-gray-900 border border-gray-800 rounded-xl p-4 h-20 animate-pulse' />
            ))}
          </div>
        ) : themes.length === 0 ? (
          <div className='bg-gray-900 border border-gray-800 rounded-xl p-8 text-center'>
            <p className='text-gray-500 text-sm'>No themes yet.</p>
            <p className='text-gray-600 text-xs mt-1'>Run AI Classification from the Overview tab to generate themes.</p>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              <div className='bg-gray-900 border border-gray-800 rounded-xl p-4'>
                <p className='text-gray-500 text-xs'>Total themes</p>
                <p className='text-white text-2xl font-bold'>{themes.length}</p>
              </div>
              <div className='bg-gray-900 border border-gray-800 rounded-xl p-4'>
                <p className='text-gray-500 text-xs'>Tagged feedback</p>
                <p className='text-white text-2xl font-bold'>{themes.reduce((s, t) => s + t.count, 0)}</p>
              </div>
              <div className='bg-gray-900 border border-gray-800 rounded-xl p-4'>
                <p className='text-gray-500 text-xs'>Top theme</p>
                <p className='text-white text-sm font-semibold truncate mt-1'>{themes[0]?.name ?? '—'}</p>
              </div>
              <div className='bg-gray-900 border border-gray-800 rounded-xl p-4'>
                <p className='text-gray-500 text-xs'>Avg per theme</p>
                <p className='text-white text-2xl font-bold'>
                  {themes.length ? Math.round(themes.reduce((s, t) => s + t.count, 0) / themes.length) : 0}
                </p>
              </div>
            </div>

            {/* Theme cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
              {themes.map(theme => {
                const color = theme.color ?? DEFAULT_COLOR
                const maxCount = themes[0]?.count || 1
                const pct = Math.round((theme.count / maxCount) * 100)
                return (
                  <button
                    key={theme.id}
                    onClick={() => openTheme(theme)}
                    className='bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 text-left flex flex-col gap-3 transition-colors group'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex items-center gap-2'>
                        <span className='w-2.5 h-2.5 rounded-full shrink-0' style={{ background: color }} />
                        <span className='text-white text-sm font-medium group-hover:text-gold-400 transition-colors'>
                          {theme.name}
                        </span>
                      </div>
                      <span className='text-xs font-bold tabular-nums shrink-0' style={{ color }}>
                        {theme.count}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className='h-1 bg-gray-800 rounded-full overflow-hidden'>
                      <div
                        className='h-full rounded-full transition-all duration-500'
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-gray-600 text-xs'>
                        {theme.count} feedback item{theme.count !== 1 ? 's' : ''}
                      </span>
                      <span className='text-gray-600 text-xs group-hover:text-gray-400 transition-colors'>
                        View →
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Drill-down view ─────────────────────────────────────────────────────────
  const color = selected.color ?? DEFAULT_COLOR

  return (
    <div className='flex flex-col gap-4'>
      {/* Back + header */}
      <div className='flex items-center gap-3'>
        <button
          onClick={() => setSelected(null)}
          className='flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors'
        >
          <FiArrowLeft size={14} /> Themes
        </button>
        <span className='text-gray-700'>/</span>
        <div className='flex items-center gap-2'>
          <span className='w-2.5 h-2.5 rounded-full' style={{ background: color }} />
          <span className='text-white font-semibold text-sm'>{selected.name}</span>
          <span className='text-xs font-bold px-2 py-0.5 rounded-full border' style={{ color, borderColor: color + '40', background: color + '10' }}>
            {pagination.total} items
          </span>
        </div>
      </div>

      {selected.description && (
        <p className='text-gray-500 text-xs'>{selected.description}</p>
      )}

      {/* Feedback list */}
      <div className='rounded-xl border border-gray-800 overflow-hidden'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-gray-800 bg-gray-900/60'>
              <th className='text-left text-xs text-gray-500 font-medium px-4 py-3'>Customer / Message</th>
              <th className='text-left text-xs text-gray-500 font-medium px-4 py-3 hidden sm:table-cell'>Channel</th>
              <th className='text-left text-xs text-gray-500 font-medium px-4 py-3 hidden md:table-cell'>Sentiment</th>
              <th className='text-left text-xs text-gray-500 font-medium px-4 py-3'>Status</th>
              <th className='text-left text-xs text-gray-500 font-medium px-4 py-3 hidden lg:table-cell'>Date</th>
            </tr>
          </thead>
          <tbody>
            {loadingDrill ? (
              Array.from({ length: LIMIT }).map((_, i) => (
                <tr key={i} className='border-b border-gray-800/50'>
                  <td colSpan={5} className='px-4 py-3'>
                    <div className='h-4 bg-gray-800 rounded animate-pulse w-3/4' />
                  </td>
                </tr>
              ))
            ) : drillItems.length === 0 ? (
              <tr>
                <td colSpan={5} className='text-center text-gray-600 text-sm py-12'>
                  No feedback linked to this theme yet.
                </td>
              </tr>
            ) : (
              drillItems.map(f => (
                <tr key={f.id} className='border-b border-gray-800/50 hover:bg-gray-900/40 transition-colors'>
                  <td className='px-4 py-3 max-w-xs'>
                    {f.customerLabel && <p className='text-xs text-gray-500 mb-0.5'>{f.customerLabel}</p>}
                    <p className='text-gray-200 text-xs leading-relaxed line-clamp-2'>{f.content}</p>
                    {f.sourceRef && (
                      <p className='text-gray-600 text-xs mt-0.5 italic line-clamp-1'>{f.sourceRef}</p>
                    )}
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
                  <td className='px-4 py-3'>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLE[f.status]}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className='px-4 py-3 hidden lg:table-cell'>
                    <span className='text-xs text-gray-600'>
                      {new Date(f.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className='flex items-center justify-between pt-1'>
          <p className='text-gray-600 text-xs'>Page {pagination.page} of {pagination.totalPages}</p>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => changeDrillPage(Math.max(1, drillPage - 1))}
              disabled={drillPage === 1 || loadingDrill}
              className='flex items-center gap-1 text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg disabled:opacity-30 transition-colors'
            >
              <FiChevronLeft size={12} /> Prev
            </button>
            <span className='text-gray-500 text-xs'>{drillPage} / {pagination.totalPages}</span>
            <button
              onClick={() => changeDrillPage(Math.min(pagination.totalPages, drillPage + 1))}
              disabled={drillPage === pagination.totalPages || loadingDrill}
              className='flex items-center gap-1 text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg disabled:opacity-30 transition-colors'
            >
              Next <FiChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
