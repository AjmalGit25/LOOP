'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts'

type Stats = {
  total: number
  byStatus:    { status: string; count: number }[]
  byChannel:   { channel: string; count: number }[]
  bySentiment: { sentiment: string; count: number }[]
  topThemes:   { name: string; color: string | null; count: number }[]
  daily:       { date: string; count: number }[]
}

const STATUS_COLOR: Record<string, string> = {
  NEW: '#60a5fa', REVIEWED: '#d4af37', ACTIONED: '#4ade80',
}
const SENTIMENT_COLOR: Record<string, string> = {
  POS: '#4ade80', NEU: '#9ca3af', NEG: '#f87171',
}
const SENTIMENT_LABEL: Record<string, string> = {
  POS: 'Positive', NEU: 'Neutral', NEG: 'Negative',
}
const CHANNEL_COLORS = ['#d4af37', '#60a5fa', '#4ade80', '#f87171', '#a78bfa', '#fb923c']
const DEFAULT_THEME_COLOR = '#6b7280'

const tooltipStyle = {
  contentStyle: { background: '#0a0a0a', border: '1px solid #1f2937', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#6b7280' },
  itemStyle: { color: '#d4af37' },
}

function EmptyChart({ label }: { label: string }) {
  return <p className='text-gray-700 text-xs text-center py-10'>{label}</p>
}

function StatCard({ label, value, sub, color }: { label: string; value: number; sub?: string; color: string }) {
  return (
    <div className='bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-1 hover:border-gray-700 transition-colors'>
      <p className='text-gray-500 text-xs'>{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${color}`}>{value.toLocaleString()}</p>
      {sub && <p className='text-gray-600 text-xs'>{sub}</p>}
    </div>
  )
}

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/feedback/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='bg-gray-900 border border-gray-800 rounded-xl p-4 h-20' />
      ))}
    </div>
  )

  if (!stats) return <p className='text-gray-600 text-sm text-center py-12'>Failed to load analytics.</p>

  const pos       = stats.bySentiment.find(s => s.sentiment === 'POS')?.count ?? 0
  const neg       = stats.bySentiment.find(s => s.sentiment === 'NEG')?.count ?? 0
  const unresolved = stats.byStatus.find(s => s.status === 'NEW')?.count ?? 0

  const sentimentData = stats.bySentiment.map(s => ({
    ...s,
    name: SENTIMENT_LABEL[s.sentiment] ?? s.sentiment,
    fill: SENTIMENT_COLOR[s.sentiment] ?? DEFAULT_THEME_COLOR,
  }))

  const themeData = stats.topThemes.map(t => ({
    ...t,
    fill: t.color ?? DEFAULT_THEME_COLOR,
  }))

  return (
    <div className='flex flex-col gap-6'>

      {/* ── Stat cards ── */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        <StatCard label='Total Feedback'  value={stats.total}  color='text-white'       sub='all time' />
        <StatCard label='Positive'        value={pos}          color='text-green-400'   sub={stats.total ? `${Math.round(pos / stats.total * 100)}% of total` : undefined} />
        <StatCard label='Negative'        value={neg}          color='text-red-400'     sub={stats.total ? `${Math.round(neg / stats.total * 100)}% of total` : undefined} />
        <StatCard label='Unresolved (New)' value={unresolved}  color='text-blue-400'   sub='awaiting action' />
      </div>

      {/* ── Row 1: Volume (wide) + Sentiment (narrow) ── */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>

        {/* Feedback volume — line chart */}
        <div className='lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3'>
          <div>
            <p className='text-white text-sm font-semibold'>Feedback Volume</p>
            <p className='text-gray-600 text-xs mt-0.5'>Last 7 days</p>
          </div>
          {stats.daily.every(d => d.count === 0)
            ? <EmptyChart label='No feedback in the last 7 days' />
            : (
              <ResponsiveContainer width='100%' height={190}>
                <LineChart data={stats.daily}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' />
                  <XAxis dataKey='date' tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} allowDecimals={false} width={28} />
                  <Tooltip {...tooltipStyle} />
                  <Line type='monotone' dataKey='count' name='Feedback' stroke='#d4af37' strokeWidth={2} dot={{ fill: '#d4af37', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Sentiment distribution — pie */}
        <div className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3'>
          <div>
            <p className='text-white text-sm font-semibold'>Sentiment</p>
            <p className='text-gray-600 text-xs mt-0.5'>Distribution</p>
          </div>
          {sentimentData.length === 0
            ? <EmptyChart label='No sentiment data yet' />
            : (
              <>
                <ResponsiveContainer width='100%' height={150}>
                  <PieChart>
                    <Pie data={sentimentData} dataKey='count' nameKey='name' cx='50%' cy='50%' outerRadius={60} innerRadius={30}>
                      {sentimentData.map((s, i) => <Cell key={i} fill={s.fill} />)}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className='flex flex-col gap-1.5'>
                  {sentimentData.map(s => (
                    <div key={s.sentiment} className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='w-2 h-2 rounded-full shrink-0' style={{ background: s.fill }} />
                        <span className='text-gray-400 text-xs'>{s.name}</span>
                      </div>
                      <span className='text-gray-300 text-xs font-medium tabular-nums'>{s.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )
          }
        </div>
      </div>

      {/* ── Row 2: Top Themes + By Channel ── */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>

        {/* Top themes — horizontal bar */}
        <div className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3'>
          <div>
            <p className='text-white text-sm font-semibold'>Top Themes</p>
            <p className='text-gray-600 text-xs mt-0.5'>By feedback count</p>
          </div>
          {themeData.length === 0
            ? <EmptyChart label='No themes assigned yet' />
            : (
              <ResponsiveContainer width='100%' height={200}>
                <BarChart data={themeData} layout='vertical' margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' horizontal={false} />
                  <XAxis type='number' tick={{ fill: '#6b7280', fontSize: 10 }} allowDecimals={false} />
                  <YAxis type='category' dataKey='name' tick={{ fill: '#9ca3af', fontSize: 11 }} width={90} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey='count' name='Feedback' radius={[0, 4, 4, 0]}>
                    {themeData.map((t, i) => <Cell key={i} fill={t.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* By channel — vertical bar */}
        <div className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3'>
          <div>
            <p className='text-white text-sm font-semibold'>By Channel</p>
            <p className='text-gray-600 text-xs mt-0.5'>Feedback source breakdown</p>
          </div>
          {stats.byChannel.length === 0
            ? <EmptyChart label='No channel data yet' />
            : (
              <ResponsiveContainer width='100%' height={200}>
                <BarChart data={stats.byChannel}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' />
                  <XAxis dataKey='channel' tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} width={28} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey='count' name='Feedback' radius={[4, 4, 0, 0]}>
                    {stats.byChannel.map((_, i) => <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* ── Row 3: Status breakdown ── */}
      <div className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3'>
        <div>
          <p className='text-white text-sm font-semibold'>Status Breakdown</p>
          <p className='text-gray-600 text-xs mt-0.5'>Workflow progress across all feedback</p>
        </div>
        {stats.byStatus.length === 0
          ? <EmptyChart label='No status data yet' />
          : (
            <div className='flex flex-col gap-3'>
              {['NEW', 'REVIEWED', 'ACTIONED'].map(s => {
                const count = stats.byStatus.find(b => b.status === s)?.count ?? 0
                const pct   = stats.total ? Math.round(count / stats.total * 100) : 0
                return (
                  <div key={s} className='flex flex-col gap-1.5'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-400'>{s}</span>
                      <span className='text-xs text-gray-500 tabular-nums'>{count} · {pct}%</span>
                    </div>
                    <div className='h-1.5 bg-gray-800 rounded-full overflow-hidden'>
                      <div
                        className='h-full rounded-full transition-all duration-500'
                        style={{ width: `${pct}%`, background: STATUS_COLOR[s] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }
      </div>

    </div>
  )
}
