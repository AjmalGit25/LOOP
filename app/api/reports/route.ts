import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-guard'
import { generateAndSaveReport } from '@/lib/reports'

const BodySchema = z.object({
  periodStart: z.string().refine(s => !Number.isNaN(Date.parse(s)), { message: 'Invalid date' }),
  periodEnd: z.string().refine(s => !Number.isNaN(Date.parse(s)), { message: 'Invalid date' }),
})

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.response!

  const body = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })

  const { periodStart, periodEnd } = parsed.data

  const start = new Date(periodStart)
  const end = new Date(periodEnd)

  try {
    const { report, content } = await generateAndSaveReport(auth.session!.user.workspaceId, start, end, auth.session!.user.id)
    return NextResponse.json({ success: true, report: { id: report.id, title: report.title, periodStart: report.periodStart, periodEnd: report.periodEnd, content } })
  } catch (err) {
    console.error('[reports] generate failed:', err)
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 })
  }
}
