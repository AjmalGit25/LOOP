import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireAuth()
  if (response) return response

  const { id } = await params

  const report = await prisma.report.findFirst({
    where: {
      id,
      workspaceId: session.user.workspaceId,
    },
  })

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  const content = report.contentJson as Record<string, unknown>
  const title = String(report.title ?? 'LOOP Report')
  const periodText = `${new Date(report.periodStart).toLocaleDateString()} — ${new Date(report.periodEnd).toLocaleDateString()}`
  const totalFeedback = Number((content?.totalFeedback as number | undefined) ?? 0)
  const positive = Number((content?.sentiment as Record<string, unknown> | undefined)?.positive ?? 0)
  const neutral = Number((content?.sentiment as Record<string, unknown> | undefined)?.neutral ?? 0)
  const negative = Number((content?.sentiment as Record<string, unknown> | undefined)?.negative ?? 0)
  const themes = Array.isArray(content?.topThemes) ? (content.topThemes as Array<Record<string, unknown>>) : []
  const quotes = Array.isArray(content?.quotes) ? (content.quotes as Array<Record<string, unknown>>) : []

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #111827; margin: 32px; line-height: 1.5; }
      h1 { font-size: 28px; margin-bottom: 10px; }
      .meta { color: #4b5563; margin-bottom: 24px; }
      .section { margin-top: 24px; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(140px, 1fr)); gap: 12px; }
      .card { border: 1px solid #d1d5db; border-radius: 10px; padding: 12px; background: #f9fafb; }
      .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
      .value { font-size: 22px; font-weight: 700; margin-top: 4px; }
      ul { margin: 8px 0 0 20px; }
      blockquote { margin: 12px 0; padding: 12px 16px; border-left: 4px solid #e5b942; background: #fef3c7; }
      @media print { body { margin: 0; } }
    </style>
  </head>
  <body>
    <h1>LOOP</h1>
    <h2>${escapeHtml(title)}</h2>
    <div class="meta">Period: ${escapeHtml(periodText)}</div>

    <div class="section">
      <h3>Executive Summary</h3>
      <p>This report summarizes ${totalFeedback} customer feedback items across the selected period. The sentiment mix was ${positive} positive, ${neutral} neutral, and ${negative} negative.</p>
    </div>

    <div class="section">
      <h3>Key Numbers</h3>
      <div class="grid">
        <div class="card"><div class="label">Total Feedback</div><div class="value">${totalFeedback}</div></div>
        <div class="card"><div class="label">Positive</div><div class="value">${positive}</div></div>
        <div class="card"><div class="label">Neutral</div><div class="value">${neutral}</div></div>
        <div class="card"><div class="label">Negative</div><div class="value">${negative}</div></div>
      </div>
    </div>

    <div class="section">
      <h3>Top Themes</h3>
      <ol>
        ${themes.map((theme) => `<li>${escapeHtml(String(theme.name ?? 'Unknown'))} — ${Number(theme.count ?? 0)}</li>`).join('') || '<li>No themes available</li>'}
      </ol>
    </div>

    <div class="section">
      <h3>Representative Quotes</h3>
      ${quotes.map((quote) => `<blockquote>“${escapeHtml(String(quote.content ?? ''))}”</blockquote>`).join('') || '<p>No quotes available.</p>'}
    </div>
  </body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="${title.replace(/\s+/g, '_')}.html"`,
    },
  })
}
