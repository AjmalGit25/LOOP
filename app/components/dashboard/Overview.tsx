'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts'

type Stats = {
  total: number
  byStatus: { status: string; count: number }[]
  byChannel: { channel: string; count: number }[]
  daily: { date: string; count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  NEW: '#60a5fa',
  REVIEWED: '#d4af37',
  ACTIONED: '#4ade80',
}

const CHANNEL_COLORS = ['#d4af37', '#60a5fa', '#4ade80', '#f87171', '#a78bfa', '#fb923c']

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/feedback/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className='flex items-center justify-center h-64'>
      <p className='text-gray-500 text-sm'>Loading analytics...</p>
    </div>
  )

  if (!stats) return null

  const newCount = stats.byStatus.find(s => s.status === 'NEW')?.count ?? 0
  const reviewedCount = stats.byStatus.find(s => s.status === 'REVIEWED')?.count ?? 0
  const actionedCount = stats.byStatus.find(s => s.status === 'ACTIONED')?.count ?? 0

  return (
    <div className='flex flex-col gap-6'>

      {/* Stat cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {[
          { label: 'Total Feedback', value: stats.total, color: 'text-white' },
          { label: 'New', value: newCount, color: 'text-blue-400' },
          { label: 'Reviewed', value: reviewedCount, color: 'text-gold-400' },
          { label: 'Actioned', value: actionedCount, color: 'text-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className='bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-1'>
            <p className='text-gray-500 text-xs'>{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>

        {/* Chart 1 — Daily volume (line) */}
        <div className='lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3'>
          <p className='text-white text-sm font-semibold'>Feedback volume — last 7 days</p>
          <ResponsiveContainer width='100%' height={180}>
            <LineChart data={stats.daily}>
              <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' />
              <XAxis dataKey='date' tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: '#d4af37' }} />
              <Line type='monotone' dataKey='count' stroke='#d4af37' strokeWidth={2} dot={{ fill: '#d4af37', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 — By status (pie) */}
        <div className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3'>
          <p className='text-white text-sm font-semibold'>By status</p>
          {stats.byStatus.length === 0
            ? <p className='text-gray-600 text-xs text-center py-8'>No data yet</p>
            : (
              <ResponsiveContainer width='100%' height={180}>
                <PieChart>
                  <Pie data={stats.byStatus} dataKey='count' nameKey='status' cx='50%' cy='50%' outerRadius={60} label={({ name }) => name}>
                    {stats.byStatus.map(entry => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Chart 3 — By channel (bar) */}
        <div className='lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3'>
          <p className='text-white text-sm font-semibold'>By channel</p>
          {stats.byChannel.length === 0
            ? <p className='text-gray-600 text-xs text-center py-8'>No data yet</p>
            : (
              <ResponsiveContainer width='100%' height={160}>
                <BarChart data={stats.byChannel}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' />
                  <XAxis dataKey='channel' tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
                  <Bar dataKey='count' radius={[4, 4, 0, 0]}>
                    {stats.byChannel.map((_, i) => (
                      <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

      </div>
    </div>
  )
}
