import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'
import { z } from 'zod'

// Expected CSV columns: content, channel
// Optional columns:     sourceRef, customerLabel
const RowSchema = z.object({
  content: z.string().min(1),
  channel: z.string().min(1),
  sourceRef: z.string().optional(),
  customerLabel: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const { session, response } = await requireRole('ADMIN', 'ANALYST')
  if (response) return response

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file || !file.name.endsWith('.csv')) {
    return NextResponse.json({ error: 'A .csv file is required' }, { status: 400 })
  }

  const text = await file.text()

  const { data, errors: parseErrors } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  })

  if (parseErrors.length) {
    return NextResponse.json({ error: 'CSV parse error', details: parseErrors }, { status: 400 })
  }

  // Validate every row
  const valid: z.infer<typeof RowSchema>[] = []
  const invalid: { row: number; issues: string[] }[] = []

  data.forEach((row, i) => {
    const result = RowSchema.safeParse(row)
    if (result.success) {
      valid.push(result.data)
    } else {
      invalid.push({
        row: i + 2, // +2 → 1-based + header row
        issues: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
      })
    }
  })

  if (valid.length === 0) {
    return NextResponse.json({ error: 'No valid rows found', invalid }, { status: 422 })
  }

  // Bulk insert — all scoped to workspaceId
  await prisma.feedback.createMany({
    data: valid.map((row) => ({
      content: row.content,
      channel: row.channel,
      sourceRef: row.sourceRef ?? null,
      customerLabel: row.customerLabel ?? null,
      workspaceId: session.user.workspaceId,
    })),
    skipDuplicates: true,
  })

  return NextResponse.json({
    imported: valid.length,
    skipped: invalid.length,
    invalid,
  }, { status: 201 })
}
