'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'

type ReportContent = {
  totalFeedback?: number
  sentiment?: { positive?: number; neutral?: number; negative?: number }
  sentimentShifts?: {
    positiveChangePercent?: number | null
    negativeChangePercent?: number | null
    neutralChangePercent?: number | null
  }
  topThemes?: Array<{ name: string; count: number }>
  quotes?: Array<{ id: string; content: string; sentiment: string | null }>
}

type Report = {
  id: string
  title: string
  periodStart: string
  periodEnd: string
  createdAt: string
  generatedBy: string
  content: ReportContent
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className='bg-gray-900 border border-gray-800 rounded-xl p-4'>
      <p className='text-gray-500 text-xs uppercase tracking-wider'>{label}</p>
      <p className='text-2xl font-bold text-white mt-2'>{value}</p>
    </div>
  )
}

export default function ReportPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    fetch(`/api/reports/${id}`)
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error ?? 'Unable to load report')
        setReport(data.report)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const exportPdfUrl = useMemo(() => (id ? `/api/reports/${id}/pdf` : '#'), [id])

  if (loading) {
    return <div className='min-h-screen bg-black text-gray-400 flex items-center justify-center'>Loading report…</div>
  }

  if (error || !report) {
    return (
      <div className='min-h-screen bg-black text-gray-300 flex items-center justify-center p-6'>
        <div className='max-w-lg w-full rounded-xl border border-red-500/30 bg-red-500/5 p-6'>
          <p className='text-red-400 text-sm font-semibold'>Report unavailable</p>
          <p className='text-gray-400 mt-2'>{error || 'This report is not available in your workspace.'}</p>
        </div>
      </div>
    )
  }

  const content = report.content ?? {}
  const total = content.totalFeedback ?? 0
  const sentiment = content.sentiment ?? { positive: 0, neutral: 0, negative: 0 }
  const themes = content.topThemes ?? []
  const quotes = content.quotes ?? []

  return (
    <main className='min-h-screen bg-black text-white'>
      <div className='mx-auto max-w-5xl px-6 py-10'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-gold-400 text-xs uppercase tracking-[0.2em]'>LOOP</p>
            <h1 className='text-3xl font-semibold mt-2'>{report.title}</h1>
            <p className='text-gray-500 text-sm mt-1'>
              {formatDate(report.periodStart)} – {formatDate(report.periodEnd)}
            </p>
          </div>

          <div className='flex gap-2'>
            <a
              href={exportPdfUrl}
              target='_blank'
              rel='noreferrer'
              className='px-4 py-2 rounded-lg border border-gold-500/40 bg-gold-500/10 text-gold-300 text-sm hover:border-gold-500 transition-colors'
            >
              Export PDF
            </a>
            <button
              type='button'
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className='px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-200 text-sm hover:border-gray-500 transition-colors'
            >
              Copy link
            </button>
          </div>
        </div>

        <div className='mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4'>
          <StatCard label='Total Feedback' value={total} />
          <StatCard label='Positive' value={sentiment.positive ?? 0} />
          <StatCard label='Neutral' value={sentiment.neutral ?? 0} />
          <StatCard label='Negative' value={sentiment.negative ?? 0} />
        </div>

        <section className='mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2'>
          <div className='rounded-xl border border-gray-800 bg-gray-900 p-5'>
            <h2 className='text-lg font-semibold'>Top Themes</h2>
            <ul className='mt-4 space-y-3'>
              {themes.length === 0 ? (
                <li className='text-gray-500 text-sm'>No themes were recorded in this period.</li>
              ) : (
                themes.map((theme, index) => (
                  <li key={`${theme.name}-${index}`} className='flex items-center justify-between border-b border-gray-800 pb-2 last:border-b-0 last:pb-0'>
                    <span className='text-gray-300'>{theme.name}</span>
                    <span className='text-gold-300 font-medium'>{theme.count}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className='rounded-xl border border-gray-800 bg-gray-900 p-5'>
            <h2 className='text-lg font-semibold'>Sentiment Change</h2>
            <div className='mt-4 space-y-3 text-sm text-gray-300'>
              <div className='flex items-center justify-between'>
                <span>Positive</span>
                <span>{content.sentimentShifts?.positiveChangePercent ?? 'n/a'}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Neutral</span>
                <span>{content.sentimentShifts?.neutralChangePercent ?? 'n/a'}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Negative</span>
                <span>{content.sentimentShifts?.negativeChangePercent ?? 'n/a'}</span>
              </div>
            </div>
          </div>
        </section>

        <section className='mt-8 rounded-xl border border-gray-800 bg-gray-900 p-5'>
          <h2 className='text-lg font-semibold'>Customer Voice</h2>
          <div className='mt-4 space-y-4'>
            {quotes.length === 0 ? (
              <p className='text-gray-500 text-sm'>No representative quotes were captured for this report.</p>
            ) : (
              quotes.map((quote, index) => (
                <blockquote key={`${quote.id ?? index}`} className='border-l-2 border-gold-400 bg-black/30 px-4 py-3 text-gray-200 italic'>
                  “{quote.content}”
                </blockquote>
              ))
            )}
          </div>
        </section>

        <footer className='mt-8 text-xs text-gray-600 border-t border-gray-800 pt-4'>
          Generated by {report.generatedBy} · {formatDate(report.createdAt)}
        </footer>
      </div>
    </main>
  )
}
