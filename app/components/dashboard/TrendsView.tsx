'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

type ThemeTrend = {
  id: string
  name: string
  color: string | null
  currentCount: number
  previousCount: number
  change: number | null   // null = new this period
  spiking: boolean
}

type TrendsData = {
  period: { start: string; end: string; days: number }
  previousPeriod: { start: string; end: string }
  themes: ThemeTrend[]
  timeline: Record<string, string | number>[]
}

type Props = { onDrillTheme?: (themeId: string, themeName: string) => void }

const PERIOD_OPTIONS = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 14 days', value: 14 },
  { label: 'Last 30 days', value: 30 },
]

const FALLBACK_COLORS = [
  '#d4af37', '#60a5fa', '#4ade80', '#f87171',
  '#a78bfa', '#fb923c', '#34d399', '#f472b6',
]

const tooltipStyle = {
  contentStyle: { background: '#0a0a0a', border: '1px solid #1f2937', borderRadius: 8, fontSize: 11 },
  labelStyle: { color: '#6b7280' },
}

function ChangeChip({ change, spiking }: { change: number | null; spiking: boolean }) {
  if (change === null) {
    return (
      <span className='text-xs px-2 py-0.5 rounded-full border text-blue-400 bg-blue-400/10 border-blue-400/20'>
        🆕 New
      </span>
    )
  }
  if (spiking) {
    return (
      <span className='text-xs px-2 py-0.5 rounded-full border text-orange-400 bg-orange-400/10 border-orange-400/20'>
        🔥 +{change}%
      </span>
    )
  }
  if (change > 0) {
    return <span className='text-xs text-green-400'>↑ {change}%</span>
  }
  if (change < 0) {
    return <span className='text-xs text-red-400'>↓ {Math.abs(change)}%</span>
  }
  return <span className='text-xs text-gray-600'>→ 0%</span>
}

export default function TrendsView({ onDrillTheme }: Props) {
  const [days, setDays] = useState(7)
  const [data, setData] = useState<TrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTrends = useCallback(async (d: number) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/themes/trends?days=${d}`)
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setError('Could not load trends data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void fetchTrends(days)
    })

    return () => cancelAnimationFrame(id)
  }, [days, fetchTrends])

  const spikingThemes = data?.themes.filter(t => t.spiking) ?? []
  const stableThemes = data?.themes.filter(t => !t.spiking) ?? []

  // Only chart themes that have at least one non-zero day
  const chartThemes = (data?.themes ?? []).filter(t => t.currentCount > 0)

  return (
    <div className='flex flex-col gap-6'>

      {/* Header + period selector */}
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <div>
          <p className='text-white font-semibold text-sm'>Trends</p>
          <p className='text-gray-500 text-xs mt-0.5'>
            Theme volume over time · spike detection vs previous period
          </p>
        </div>
        <div className='flex gap-1'>
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${days === opt.value
                ? 'border-gold-500/40 bg-gold-500/10 text-gold-400'
                : 'border-gray-700 text-gray-500 hover:text-white hover:border-gray-600'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className='flex flex-col items-center justify-center rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-center'>
          <p className='text-red-400 text-sm font-medium'>{error}</p>
          <button
            onClick={() => fetchTrends(days)}
            className='mt-3 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs hover:border-red-500/50 transition-colors'
          >
            Retry
          </button>
        </div>
      )}

      {/* Volume chart */}
      <div className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3'>
        <div>
          <p className='text-white text-sm font-semibold'>Theme Volume</p>
          {data && (
            <p className='text-gray-600 text-xs mt-0.5'>
              {data.period.start} → {data.period.end}
            </p>
          )}
        </div>

        {loading ? (
          <div className='h-52 bg-gray-800 rounded-lg animate-pulse' />
        ) : !data || chartThemes.length === 0 ? (
          <p className='text-gray-700 text-xs text-center py-12'>
            No theme data for this period. Run AI Classification to generate themes.
          </p>
        ) : (
          <ResponsiveContainer width='100%' height={220}>
            <LineChart data={data.timeline}>
              <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' />
              <XAxis
                dataKey='date'
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickFormatter={d => (d as string).slice(5)}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 10 }}
                allowDecimals={false}
                width={24}
              />
              <Tooltip {...tooltipStyle} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#9ca3af', paddingTop: 8 }}
              />
              {chartThemes.map((t, i) => (
                <Line
                  key={t.id}
                  type='monotone'
                  dataKey={t.name}
                  stroke={t.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                  strokeWidth={t.spiking ? 2.5 : 1.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Spike cards */}
      {!loading && data && spikingThemes.length > 0 && (
        <div className='flex flex-col gap-3'>
          <p className='text-white text-sm font-semibold'>
            🔥 Spiking Themes
            <span className='text-gray-600 text-xs font-normal ml-2'>
              ≥50% increase vs previous {data.period.days}-day period
            </span>
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            {spikingThemes.map((t, i) => {
              const color = t.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]
              return (
                <button
                  key={t.id}
                  onClick={() => onDrillTheme?.(t.id, t.name)}
                  className='bg-gray-900 border border-orange-500/20 hover:border-orange-500/40 rounded-xl p-4 text-left flex flex-col gap-2 transition-colors group'
                >
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <span className='w-2 h-2 rounded-full shrink-0' style={{ background: color }} />
                      <span className='text-white text-sm font-medium group-hover:text-gold-400 transition-colors'>
                        {t.name}
                      </span>
                    </div>
                    <ChangeChip change={t.change} spiking={t.spiking} />
                  </div>
                  <p className='text-gray-300 text-xs tabular-nums'>
                    {t.currentCount} feedback this period
                    {t.previousCount > 0 && (
                      <span className='text-gray-600'> · {t.previousCount} previous</span>
                    )}
                  </p>
                  {onDrillTheme && (
                    <span className='text-gray-600 text-xs group-hover:text-gray-400 transition-colors'>
                      View feedback →
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* All themes table */}
      {!loading && data && data.themes.length > 0 && (
        <div className='bg-gray-900 border border-gray-800 rounded-xl overflow-hidden'>
          <div className='px-4 py-3 border-b border-gray-800'>
            <p className='text-white text-sm font-semibold'>All Themes</p>
            <p className='text-gray-600 text-xs mt-0.5'>
              Current vs previous {data.period.days}-day period
            </p>
          </div>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-800 bg-gray-900/60'>
                <th className='text-left text-xs text-gray-500 font-medium px-4 py-2.5'>Theme</th>
                <th className='text-right text-xs text-gray-500 font-medium px-4 py-2.5'>Current</th>
                <th className='text-right text-xs text-gray-500 font-medium px-4 py-2.5 hidden sm:table-cell'>Previous</th>
                <th className='text-right text-xs text-gray-500 font-medium px-4 py-2.5'>Change</th>
                <th className='text-xs text-gray-500 font-medium px-4 py-2.5 hidden md:table-cell'></th>
              </tr>
            </thead>
            <tbody>
              {[...spikingThemes, ...stableThemes].map((t, i) => {
                const color = t.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]
                return (
                  <tr
                    key={t.id}
                    className='border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer'
                    onClick={() => onDrillTheme?.(t.id, t.name)}
                  >
                    <td className='px-4 py-2.5'>
                      <div className='flex items-center gap-2'>
                        <span className='w-2 h-2 rounded-full shrink-0' style={{ background: color }} />
                        <span className='text-gray-200 text-xs'>{t.name}</span>
                        {t.spiking && <span className='text-orange-400 text-xs'>🔥</span>}
                      </div>
                    </td>
                    <td className='px-4 py-2.5 text-right'>
                      <span className='text-gray-200 text-xs tabular-nums font-medium'>{t.currentCount}</span>
                    </td>
                    <td className='px-4 py-2.5 text-right hidden sm:table-cell'>
                      <span className='text-gray-600 text-xs tabular-nums'>{t.previousCount}</span>
                    </td>
                    <td className='px-4 py-2.5 text-right'>
                      <ChangeChip change={t.change} spiking={t.spiking} />
                    </td>
                    <td className='px-4 py-2.5 hidden md:table-cell'>
                      <span className='text-gray-700 text-xs hover:text-gray-400 transition-colors'>
                        View →
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data && data.themes.length === 0 && !error && (
        <div className='bg-gray-900 border border-gray-800 rounded-xl p-8 text-center'>
          <p className='text-gray-500 text-sm'>No theme data for this period.</p>
          <p className='text-gray-600 text-xs mt-1'>Run AI Classification from the Overview tab to generate themes.</p>
        </div>
      )}
    </div>
  )
}
