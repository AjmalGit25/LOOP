'use client'

import { useState } from 'react'
import { FiZap } from 'react-icons/fi'

const SOURCES = [
  { value: 'all',     label: 'All channels',  icon: '🌐' },
  { value: 'slack',   label: 'Slack',         icon: '💬' },
  { value: 'email',   label: 'Email',         icon: '📧' },
  { value: 'support', label: 'Support',       icon: '🎧' },
  { value: 'mobile',  label: 'Mobile',        icon: '📱' },
  { value: 'web',     label: 'Web',           icon: '🌍' },
]

type Props = { onDone?: () => void }

export default function SimulateChannel({ onDone }: Props) {
  const [source, setSource] = useState('all')
  const [count, setCount] = useState(130)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ inserted: number } | null>(null)
  const [error, setError] = useState('')

  async function handleSimulate() {
    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch('/api/feedback/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, count }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Simulation failed')
      return
    }

    setResult(data)
    onDone?.()
  }

  return (
    <div className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <FiZap size={15} className='text-gold-400' />
        <h3 className='text-white text-sm font-semibold'>Simulate Channel</h3>
        <span className='text-xs text-gray-500 ml-auto'>Inserts realistic feedback into your workspace</span>
      </div>

      <div className='grid grid-cols-3 sm:grid-cols-6 gap-2'>
        {SOURCES.map(s => (
          <button
            key={s.value}
            onClick={() => setSource(s.value)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors
              ${source === s.value
                ? 'border-gold-500/50 bg-gold-500/10 text-gold-400'
                : 'border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300'
              }`}
          >
            <span className='text-lg'>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      <div className='flex items-center gap-3'>
        <div className='flex flex-col gap-1 flex-1'>
          <label className='text-gray-500 text-xs'>Records to insert</label>
          <input
            type='number'
            min={10}
            max={150}
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            className='bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-gold-500 w-28'
          />
        </div>

        <button
          onClick={handleSimulate}
          disabled={loading}
          className='self-end bg-linear-to-r from-gold-300 to-gold-600 text-black font-bold px-5 py-2 rounded-full text-sm hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-50 flex items-center gap-2 cursor-pointer'
        >
          <FiZap size={14} />
          {loading ? 'Seeding...' : 'Seed Feedback'}
        </button>
      </div>

      {error && <p className='text-red-400 text-xs'>{error}</p>}

      {result && (
        <div className='flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2'>
          <span className='text-green-400 text-sm font-bold'>✓</span>
          <p className='text-green-400 text-sm'>
            {result.inserted} feedback records inserted from <span className='font-medium'>{SOURCES.find(s => s.value === source)?.label}</span>
          </p>
        </div>
      )}
    </div>
  )
}
