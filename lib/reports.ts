import { prisma } from './prisma'

type ThemeCount = { name: string; count: number }

export type ReportContent = {
  totalFeedback: number
  sentiment: { positive: number; neutral: number; negative: number }
  sentimentShifts: { positiveChangePercent: number | null; negativeChangePercent: number | null; neutralChangePercent: number | null }
  topThemes: ThemeCount[]
  quotes: { id: string; content: string; sentiment: string | null }[]
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

export async function computeReportForPeriod(workspaceId: string, periodStart: Date, periodEnd: Date): Promise<ReportContent> {
  // Fetch feedback in the current period
  const feedback = await prisma.feedback.findMany({
    where: {
      workspaceId,
      createdAt: { gte: periodStart, lte: periodEnd },
    },
    select: { id: true, content: true, sentiment: true, createdAt: true },
  })

  const totalFeedback = feedback.length

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 }
  for (const f of feedback) {
    if (f.sentiment === 'POS') sentimentCounts.positive++
    else if (f.sentiment === 'NEU') sentimentCounts.neutral++
    else if (f.sentiment === 'NEG') sentimentCounts.negative++
  }

  // Previous period: same length immediately before the current period
  const periodLengthMs = periodEnd.getTime() - periodStart.getTime()
  const prevEnd = new Date(periodStart.getTime() - 1)
  const prevStart = new Date(periodStart.getTime() - periodLengthMs)

  const prevCounts = await prisma.$transaction([
    prisma.feedback.count({ where: { workspaceId, createdAt: { gte: prevStart, lte: prevEnd }, sentiment: 'POS' } }),
    prisma.feedback.count({ where: { workspaceId, createdAt: { gte: prevStart, lte: prevEnd }, sentiment: 'NEU' } }),
    prisma.feedback.count({ where: { workspaceId, createdAt: { gte: prevStart, lte: prevEnd }, sentiment: 'NEG' } }),
  ])

  const [prevPos, prevNeu, prevNeg] = prevCounts

  const sentimentShifts = {
    positiveChangePercent: percentChange(sentimentCounts.positive, prevPos),
    neutralChangePercent: percentChange(sentimentCounts.neutral, prevNeu),
    negativeChangePercent: percentChange(sentimentCounts.negative, prevNeg),
  }

  // Top themes: aggregate via FeedbackTheme -> Theme for feedback in range
  const fThemes = await prisma.feedbackTheme.findMany({
    where: { feedback: { workspaceId, createdAt: { gte: periodStart, lte: periodEnd } } },
    include: { theme: { select: { name: true } } },
  })

  const themeCounts = new Map<string, number>()
  for (const ft of fThemes) {
    const name = ft.theme.name
    themeCounts.set(name, (themeCounts.get(name) ?? 0) + 1)
  }

  const topThemes: ThemeCount[] = Array.from(themeCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Representative quotes: choose up to 5 feedback items from the period
  const quotes = feedback
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map(f => ({ id: f.id, content: f.content, sentiment: f.sentiment }))

  return {
    totalFeedback,
    sentiment: { positive: sentimentCounts.positive, neutral: sentimentCounts.neutral, negative: sentimentCounts.negative },
    sentimentShifts,
    topThemes,
    quotes,
  }
}

export async function generateAndSaveReport(workspaceId: string, periodStart: Date, periodEnd: Date, generatedById: string) {
  const content = await computeReportForPeriod(workspaceId, periodStart, periodEnd)

  const title = `Voice of Customer: ${periodStart.toISOString().slice(0, 10)} → ${periodEnd.toISOString().slice(0, 10)}`

  const saved = await prisma.report.create({
    data: {
      title,
      periodStart,
      periodEnd,
      contentJson: content as any,
      workspaceId,
      generatedById,
    },
  })

  return { report: saved, content }
}

export default { computeReportForPeriod, generateAndSaveReport }
