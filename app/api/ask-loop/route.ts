import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateEmbedding, askWithEvidence } from '@/lib/ai'

const ReqSchema = z.object({ question: z.string().min(3), topK: z.number().int().min(1).max(20).optional() })

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth()
  if (response) return response

  const body = await req.json()
  const parsed = ReqSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { question, topK = 5 } = parsed.data
  const workspaceId = session.user.workspaceId

  // 1) Embed the question
  let qVec: number[]
  try {
    qVec = await generateEmbedding(question)
  } catch (err) {
    console.error('[ask-loop] embedding failed:', err)
    return NextResponse.json({ error: 'Failed to embed question' }, { status: 500 })
  }

  // Build pgvector literal
  const vecLiteral = `[${qVec.map(n => Number(n)).join(',')}]`

  // 2) Semantic search via raw SQL using pgvector <-> operator (distance)
  try {
    const rows: { id: string; content: string; distance: number }[] = await prisma.$queryRawUnsafe(
      `SELECT f.id, f.content, (e.vector <-> '${vecLiteral}'::vector) AS distance
       FROM \"Embedding\" e
       JOIN \"Feedback\" f ON e.\"feedbackId\" = f.id
       WHERE f.\"workspaceId\" = '${workspaceId}'
       ORDER BY e.vector <-> '${vecLiteral}'::vector
       LIMIT ${topK}`
    )

    const evidences = rows.map(r => ({ id: r.id, content: r.content }))

    // 3) Ask Claude with evidence for a grounded answer
    const answer = await askWithEvidence(question, evidences)

    return NextResponse.json({ answer, evidences }, { status: 200 })
  } catch (err) {
    console.error('[ask-loop] retrieval or Claude failed:', err)
    return NextResponse.json({ error: 'Retrieval or answer generation failed' }, { status: 500 })
  }
}
