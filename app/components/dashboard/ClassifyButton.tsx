'use client'

import { useEffect, useState } from 'react'

type Props = { onDone?: () => void }
type CountData = { unclassified: number; total: number }
type RunResult = { classified: number; skipped: number; remaining: number; message: string }

export default function ClassifyButton({ onDone }: Props) {
  const [counts, setCounts]   = useState<CountData | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<RunResult | null>(null)
  const [error, setError]     = useState('')
  const [batchSize, setBatch] = useState(20)

  async function fetchCounts() {
    try {
      const res = await fetch('/api/feedback/classify')
      if (res.ok) setCounts(await res.json())
    } catch { /* silent */ }
  }

  useEffect(() => { fetchCounts() }, [])

  async function run() {
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const res = await fetch('/api/feedback/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: batchSize }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Classification failed')
      setResult(data)
      setCounts(prev => prev ? { ...prev, unclassified: data.remaining } : null)
      onDone?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const noneLeft = counts?.unclassified === 0

  return (
    <div className='flex flex-col gap-3'>
      {/* Status line */}
      <div className='flex items-center gap-3 flex-wrap'>
        {counts && (
          <span className={`text-xs px-2 py-0.5 rounded-full border ${
            noneLeft
              ? 'text-green-400 bg-green-400/10 border-green-400/20'
              : 'text-gold-400 bg-gold-400/10 border-gold-400/20'
          }`}>
            {noneLeft
              ? '✓ All classified'
              : `${counts.unclassified} of ${counts.total} unclassified`
            }
          </span>
        )}
      </div>

      {/* Controls */}
      <div className='flex items-center gap-2 flex-wrap'>
        <button
          onClick={run}
          disabled={loading || noneLeft}
          className='flex items-center gap-2 text-sm bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
        >
          {loading ? (
            <>
              <span className='w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin shrink-0' />
              Classifying...
            </>
          ) : '🧠 Run AI Classification'}
        </button>

        {/* Batch size */}
        {!noneLeft && (
          <select
            value={batchSize}
            onChange={e => setBatch(Number(e.target.value))}
            disabled={loading}
            className='bg-gray-800 border border-gray-700 text-gray-400 text-xs rounded-lg px-2 py-2 focus:outline-none disabled:opacity-40'
          >
            {[10, 20, 30, 50].map(n => (
              <option key={n} value={n} className='bg-gray-900'>{n} items</option>
            ))}
          </select>
        )}
      </div>

      {/* Result / error */}
      {result && !loading && (
        <p className='text-green-400 text-xs'>✓ {result.message}</p>
      )}
      {error && !loading && (
        <p className='text-red-400 text-xs'>✗ {error}</p>
      )}

      <p className='text-gray-600 text-xs'>
        Classifies unclassified feedback using Claude · Already-classified items are skipped · Results stored in DB
      </p>
    </div>
  )
}
