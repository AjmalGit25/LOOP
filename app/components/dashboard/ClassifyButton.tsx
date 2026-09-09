'use client'

import { useState } from 'react'

type Props = { onDone?: () => void }

type Result = { classified: number; total: number; message: string }

export default function ClassifyButton({ onDone }: Props) {
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<Result | null>(null)
  const [error, setError]       = useState('')

  async function run() {
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const res = await fetch('/api/feedback/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 20 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Classification failed')
      setResult(data)
      onDone?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-3'>
        <button
          onClick={run}
          disabled={loading}
          className='flex items-center gap-2 text-sm bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? (
            <>
              <span className='w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin' />
              Classifying...
            </>
          ) : (
            <>🧠 Run AI Classification</>
          )}
        </button>

        {result && !loading && (
          <p className='text-green-400 text-xs'>
            ✓ {result.message}
          </p>
        )}
        {error && !loading && (
          <p className='text-red-400 text-xs'>✗ {error}</p>
        )}
      </div>

      <p className='text-gray-600 text-xs'>
        Classifies up to 20 unclassified feedback items using Claude. Already-classified items are skipped.
      </p>
    </div>
  )
}
